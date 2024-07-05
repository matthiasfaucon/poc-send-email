import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Course } from './Course';

@Entity()
export class CourseCategory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @OneToMany(() => Course, course => course.category)
    courses!: Course[]; // Relation vers les cours dans cette catégorie
}
