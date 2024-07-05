// src/database.ts

import { DataSource } from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { CourseCategory } from './CourseCategory';

export const DataSourceCRM = new DataSource({
    type: 'sqlite',
    database: 'poc.sqlite3',
    synchronize: true,
    logging: true,
    entities: [User, Course, CourseCategory],
  });
