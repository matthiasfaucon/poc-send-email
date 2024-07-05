import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './User';
import { CourseCategory } from './CourseCategory';

@Entity()
export class Course extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'int', nullable: false })
    supervising_staff_id!: number;

    @ManyToMany(() => User, adherent => adherent.courses)
    adherents!: User[]; // Relation Many-to-Many vers les adhérents

    @Column({ type: 'int', nullable: false })
    localisation_id!: number;

    @ManyToOne(() => CourseCategory, category => category.courses)
    category!: CourseCategory; // Relation vers la catégorie de cours

    @Column({ type: 'int', nullable: false })
    difficulty_id!: number;

    @Column({ type: 'int', nullable: false })
    age_category!: number;

    @Column({ type: 'int', nullable: false }) 
    time_slot!: number;
}
