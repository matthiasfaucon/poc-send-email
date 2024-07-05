import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Course } from './Course';
import { Role } from './RoleEnum';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    password!: string;

    @Column({ unique: true })
    phone_number!: string;

    @Column()
    lastname!: string;

    @Column()
    firstname!: string;

    @Column()
    birthday!: Date;

    @Column({ unique: true })
    email!: string;

    @Column()
    postal_code!: string;

    @Column()
    address!: string;

    @Column()
    is_contribution_paid!: boolean;

    @ManyToMany(() => User, member => member.guardians)
    @JoinTable()
    children!: User[];

    @ManyToMany(() => User, member => member.children)
    guardians!: User[];

    @ManyToMany(() => Course, course => course.adherents)
    @JoinTable()
    courses!: Course[];

    @Column({
        type: 'simple-array',
        nullable: true,
    })
    roles: Role[] = [];

}
