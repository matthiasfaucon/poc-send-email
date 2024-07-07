// src/app.ts

import express, { Request, Response } from 'express';
import { DataSourceCRM } from './database';
import { User } from './User';
import { Course } from './Course';
import { CourseCategory } from './CourseCategory';
import { Role } from './RoleEnum';
import { sendEmails } from './services/sendEmail';
import 'dotenv/config'

DataSourceCRM
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

const app = express();
const port = 3000;

app.use(express.json());

app.get('/adherent', async (req: Request, res: Response) => {
    const adherents = await User.find({
        relations: ['guardians'],
        where: { roles: Role.Adherent },
    });
    res.json(adherents);
});

app.post('/adherent', async (req: Request, res: Response) => {
        const { email } = req.body;

        // Vérifier si un adhérent existe déjà avec cet email
        let existingAdherent = await User.findOne({ where: { email } });
        if (existingAdherent) {
            return res.status(409).json({ message: 'Adherent with this email already exists' });
        }

        // Et on vérifie aussi si un adhérent existe déjà avec ce numéro de téléphone
        existingAdherent = await User.findOne({ where: { phone_number: req.body.phone_number } });
        if (existingAdherent) {
            return res.status(409).json({ message: 'Adherent with this phone number already exists' });
        }

        const {
            password,
            phone_number,
            lastname,
            firstname,
            birthday,
            postal_code,
            address,
            is_contribution_paid,
            roles
        } = req.body;

        const adherent = new User();
        adherent.password = password;
        adherent.phone_number = phone_number;
        adherent.lastname = lastname;
        adherent.firstname = firstname;
        adherent.birthday = new Date(birthday);
        adherent.email = email;
        adherent.postal_code = postal_code;
        adherent.address = address;
        adherent.is_contribution_paid = is_contribution_paid;

        // Si l'adhérent à moins de 18 ans, ajouter 2 responsables légaux
        if (new Date().getFullYear() - new Date(birthday).getFullYear() < 18) {

            const guardian1 = new User()
            guardian1.firstname = "Guardian1";
            guardian1.lastname = "Guardian1";
            guardian1.birthday = new Date();
            guardian1.email = process.env.GUARDIAN1_EMAIL;
            guardian1.password = "password";
            guardian1.phone_number = "89851";
            guardian1.postal_code = "75000";
            guardian1.address = "Paris";
            guardian1.roles = [Role.LegalGuardian];

            guardian1.is_contribution_paid = false;
            await guardian1.save();

            const guardian2 = new User()
            guardian2.firstname = "Guardian2";
            guardian2.lastname = "Guardian2";
            guardian2.birthday = new Date();
            guardian2.email = process.env.GUARDIAN2_EMAIL;
            guardian2.phone_number = "5161589";
            guardian2.password = "password";
            guardian2.postal_code = "75000";
            guardian2.address = "Paris";
            guardian2.roles = [Role.LegalGuardian];

            guardian2.is_contribution_paid = false;
            await guardian2.save();

            if (!guardian1 || !guardian2) {
                return res.status(404).json({ message: 'Guardians not found' });
            }
            
            if (!adherent.guardians) {
                adherent.guardians = [];
            }

            adherent.guardians.push(guardian1, guardian2);
        }


        if (roles) {
            adherent.roles.push(...roles);
        } else {
            return res.status(400).json({ message: 'Roles are required for dev you need to use =>' + " roles: [Administrator] in the body" });
        }

        await adherent.save();
        return res.json(adherent);

});

// Envoi d'un email de bienvenue à tous les adhérents
app.post('/adherent/send-mail', async (req: Request, res: Response) => {
    try {
        const { subject, bodyEmail } = req.body;

        // Récupérer tous les adhérents
        const adherents = await User.find({
            relations: ['guardians', 'guardians']
        });

        // Filtrer les adhérents qui ont le rôle 'Adherent'
        const adherentsWithRoleAdherent = adherents.filter(adherent =>
            adherent.roles.includes(Role.Adherent)
        );

        if (adherentsWithRoleAdherent.length === 0) {
            return res.status(404).json({ message: 'No adherents with role Adherent found' });
        }

        sendEmails(adherentsWithRoleAdherent, subject, bodyEmail);
        
        return res.json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ message: 'Failed to send emails' });
    }
});

app.get('/courses', async (req: Request, res: Response) => {
    const courses = await Course.find();
    res.json(courses);
});

app.post('/courses', async (req: Request, res: Response) => {
    try {
        const {
            name,
            supervising_staff_id,
            localisation_id,
            course_category_id,
            difficulty_id,
            age_category,
            time_slot
        } = req.body;

        const category = await CourseCategory.findOne({ where: { id: course_category_id } });

        if (!category) {
            return res.status(404).json({ message: 'Course category not found' });
        }

        const course = new Course();
        course.name = name;
        course.supervising_staff_id = supervising_staff_id;
        course.localisation_id = localisation_id;
        course.category = category; // Assigner la catégorie trouvée
        course.difficulty_id = difficulty_id;
        course.age_category = age_category;
        course.time_slot = time_slot;

        await course.save();
        res.json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Failed to create course' });
    }
});

app.post('/courses_category/:categoryId/adherent/send-mail', async (req: Request, res: Response) => {
    try {
        const { subject, bodyEmail } = req.body;
        const categoryId = parseInt(req.params.categoryId);

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const category = await CourseCategory.findOne({ where: { id: categoryId }, relations: ['courses'] });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Récupérer tous les cours de la catégorie
        const courses = await Course.find({ where: { category: category }, relations: ['adherents'] });

        // Utiliser un Set pour éviter les doublons d'adhérents
        const adherentsSet = new Set<User>();
        courses.forEach(course => {
            course.adherents.forEach(adherent => adherentsSet.add(adherent));
        });

        // Convertir Set en tableau
        const adherents = Array.from(adherentsSet);

        // Vérifier si des adhérents ont été trouvés
        if (adherents.length === 0) {
            return res.status(404).json({ message: 'No adherents found for this category' });
        }

        // Appel à la fonction d'envoi d'emails
        sendEmails(adherents, subject, bodyEmail);

        return res.json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ message: 'Failed to send emails' });
    }
});

app.post('/courses/:courseId/adherent/send-mail', async (req: Request, res: Response) => {
    try {
        const { subject, bodyEmail } = req.body;
        const courseId = parseInt(req.params.courseId);

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const course = await Course.findOne({ where: { id: courseId }, relations: ['adherents'] });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const adherents = course.adherents

        console.log('course', adherents);

        console.log('adherents', adherents.length);

        const emailSubject = `Cours ${course.name} - ${subject}`;

        // Appel à la fonction d'envoi d'emails
        sendEmails(adherents, emailSubject, bodyEmail);

        return res.json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ message: 'Failed to send emails' });
    }
});

app.get('/courses_category', async (req: Request, res: Response) => {
    const courses_category = await CourseCategory.find();
    res.json(courses_category);
});

app.get('/courses_category/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const course_category = await CourseCategory.findOne({
        where: { id: id }
    });
    res.json(course_category);
});

// Récupérer tous les utilisateurs d'une catégorie
app.get('/courses_category/:id/adherents', async (req: Request, res: Response) => {
    
    const id = parseInt(req.params.id);
    const course_category = await CourseCategory.findOne({
        where: { id: id },
        relations: ['courses', 'courses.adherents']
    });

    if (!course_category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    const adherentsSet = new Set<User>();
    course_category.courses.forEach(course => {
        course.adherents.forEach(adherent => adherentsSet.add(adherent));
    });

    const adherents = Array.from(adherentsSet);
    res.json(adherents);
});

app.post('/courses_category', async (req: Request, res: Response) => {
    const {
       name
    } = req.body;

    const category = new CourseCategory();
    category.name = name;

    await category.save();
    res.json(category);
});

app.post('/course/addAdherent', async (req: Request, res: Response) => {
    const { adherentId, courseId } = req.body;

    try {
        // Vérifier si le cours existe
        const course = await Course.findOne({ where: { id: courseId }, relations: ['adherents'] });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Vérifier si l'adhérent existe
        const adherent = await User.findOne({ where: { id: adherentId }, relations: ['courses'] });
        if (!adherent) {
            return res.status(404).json({ message: 'Adherent not found' });
        }
        console.log(adherent.roles);
        // vérifier que le rôle de l'adhérent est bien Adherent
        if (!adherent.roles.includes(Role.Adherent)) {
            return res.status(400).json({ message: 'The user is not an adherent' });
        }

        // Ajouter l'adhérent au cours
        course.adherents.push(adherent);
        await course.save();

        // Ajouter le cours à l'adhérent
        adherent.courses.push(course);
        await adherent.save();

        res.json({ message: 'Adherent added to course successfully' });
    } catch (error) {
        console.error('Error adding adherent to course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/course/:id/adherents', async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);

    try {
        // Trouver le cours par son identifiant avec ses adhérents associés
        const course = await Course.findOne({
            where: { id: courseId },
            relations: ['adherents']
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course.adherents);
    } catch (error) {
        console.error('Error fetching course adherents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
