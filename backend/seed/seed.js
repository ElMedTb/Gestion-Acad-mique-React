import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import Diploma from '../models/Diploma.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import UE from '../models/UE.js';
import User from '../models/User.js';

dotenv.config();

const users = [
  { email: 'admin@academic.com', password: 'password123', firstName: 'Admin', lastName: 'Central', role: 'admin' },
  { email: 'scolarite1@academic.com', password: 'password123', firstName: 'Sara', lastName: 'Scolarite', role: 'scolarite' },
  { email: 'teacher1@academic.com', password: 'password123', firstName: 'Nabil', lastName: 'Bennis', role: 'teacher' },
  { email: 'teacher2@academic.com', password: 'password123', firstName: 'Leila', lastName: 'Mansouri', role: 'teacher' },
  { email: 'student1@academic.com', password: 'password123', firstName: 'Yasmine', lastName: 'Amrani', role: 'student' },
  { email: 'student2@academic.com', password: 'password123', firstName: 'Mehdi', lastName: 'El Idrissi', role: 'student' },
  { email: 'student3@academic.com', password: 'password123', firstName: 'Imane', lastName: 'Tazi', role: 'student' },
];

async function seed() {
  await connectDB();

  await Promise.all([
    Grade.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Course.deleteMany({}),
    UE.deleteMany({}),
    Diploma.deleteMany({}),
    User.deleteMany({}),
  ]);
  const createdUsers = await Promise.all(users.map((user) => User.create(user)));
  const byEmail = Object.fromEntries(createdUsers.map((user) => [user.email, user]));

  const teacher1 = await Teacher.create({
    user: byEmail['teacher1@academic.com']._id,
    speciality: 'Intelligence Artificielle',
    phone: '+212600000010',
    office: 'B204',
  });
  const teacher2 = await Teacher.create({
    user: byEmail['teacher2@academic.com']._id,
    speciality: 'Cloud Computing',
    phone: '+212600000011',
    office: 'A301',
  });

  const diploma1 = await Diploma.create({
    name: 'Master Big Data & Smart Computing',
    code: 'MBDS-2026',
    description: 'Formation Big Data, IA, Cloud et securite.',
    duration: 2,
  });
  const diploma2 = await Diploma.create({
    name: 'Master Business Intelligence',
    code: 'BI-2026',
    description: 'Formation data engineering et aide a la decision.',
    duration: 2,
  });
  const diploma3 = await Diploma.create({
    name: 'Parcours Intelligence Artificielle',
    code: 'IA-2026',
    description: 'Double diplomation orientee IA et data science.',
    duration: 2,
  });

  const student1 = await Student.create({
    user: byEmail['student1@academic.com']._id,
    diploma: diploma1._id,
    phone: '+212600000001',
    level: '5eme Annee',
    className: 'MBDS',
    filiere: 'INFO (IIR)',
    group: 'A',
    address: { street: '12 Rue Atlas', city: 'Casablanca', state: 'Casablanca-Settat', zipCode: '20000', country: 'Maroc' },
  });
  const student2 = await Student.create({
    user: byEmail['student2@academic.com']._id,
    diploma: diploma1._id,
    doubleDiplomation: [diploma3._id],
    phone: '+212600000002',
    level: '5eme Annee',
    className: 'MBDS',
    filiere: 'INFO (IIR)',
    group: 'A',
    address: { street: '8 Avenue Hassan II', city: 'Rabat', state: 'Rabat-Sale-Kenitra', zipCode: '10000', country: 'Maroc' },
  });
  const student3 = await Student.create({
    user: byEmail['student3@academic.com']._id,
    diploma: diploma2._id,
    phone: '+212600000003',
    level: '5eme Annee',
    className: 'BI',
    filiere: 'Finance',
    group: 'B',
    address: { street: '21 Boulevard Zerktouni', city: 'Marrakech', state: 'Marrakech-Safi', zipCode: '40000', country: 'Maroc' },
  });

  const ia = await Course.create({
    name: 'Intelligence Artificielle',
    code: 'IA-301',
    description: "Concepts fondamentaux de l'IA et de l'apprentissage automatique.",
    syllabus: 'Recherche, ML supervise, reseaux de neurones, evaluation.',
    prerequisites: [],
    coefficient: 3,
    credits: 4,
    teacher: teacher1._id,
  });
  const bigData = await Course.create({
    name: 'Big Data',
    code: 'BD-302',
    description: 'Traitement distribue et pipelines de donnees massives.',
    syllabus: 'Hadoop, Spark, streaming, optimisation.',
    prerequisites: [ia._id],
    coefficient: 3,
    credits: 4,
    teacher: teacher1._id,
  });
  const cloud = await Course.create({
    name: 'Cloud Computing',
    code: 'CL-303',
    description: 'Architecture cloud, conteneurs et deploiement.',
    syllabus: 'Docker, CI/CD, orchestration, supervision.',
    prerequisites: [],
    coefficient: 2,
    credits: 3,
    teacher: teacher2._id,
  });
  const security = await Course.create({
    name: 'Securite Applicative',
    code: 'SEC-304',
    description: 'Authentification, roles, securisation API et bonnes pratiques.',
    syllabus: 'OAuth 2, JWT, OTP, controle acces, audit.',
    prerequisites: [cloud._id],
    coefficient: 2,
    credits: 3,
    teacher: teacher2._id,
  });

  const ue1 = await UE.create({
    name: 'Data Science et IA',
    code: 'UE-IA-1',
    semester: 1,
    eliminatoryThreshold: 6,
    diploma: diploma1._id,
    referentTeacher: teacher1._id,
    courses: [ia._id, bigData._id],
  });
  const ue2 = await UE.create({
    name: 'Cloud et Securite',
    code: 'UE-CLOUD-1',
    semester: 1,
    eliminatoryThreshold: 6,
    diploma: diploma1._id,
    referentTeacher: teacher2._id,
    courses: [cloud._id, security._id],
  });
  const ue3 = await UE.create({
    name: 'Ingenierie Decisionnelle',
    code: 'UE-DATA-2',
    semester: 2,
    eliminatoryThreshold: 7,
    diploma: diploma2._id,
    referentTeacher: teacher1._id,
    courses: [bigData._id, cloud._id],
  });

  diploma1.ues = [ue1._id, ue2._id];
  diploma2.ues = [ue3._id];
  diploma3.ues = [ue1._id];
  await Promise.all([diploma1.save(), diploma2.save(), diploma3.save()]);

  await Grade.insertMany([
    { student: student1._id, course: ia._id, ue: ue1._id, value: 15.5, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher1@academic.com']._id, comment: 'Tres bon travail' },
    { student: student1._id, course: bigData._id, ue: ue1._id, value: 13, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher1@academic.com']._id },
    { student: student1._id, course: cloud._id, ue: ue2._id, value: 11.5, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher2@academic.com']._id },
    { student: student1._id, course: security._id, ue: ue2._id, value: 5.5, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher2@academic.com']._id, comment: 'Note eliminatoire' },
    { student: student2._id, course: ia._id, ue: ue1._id, value: 12, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher1@academic.com']._id },
    { student: student2._id, course: bigData._id, ue: ue1._id, value: 14, session: 'normal', semester: 1, academicYear: '2025-2026', gradedBy: byEmail['teacher1@academic.com']._id },
    { student: student3._id, course: bigData._id, ue: ue3._id, value: 16, session: 'normal', semester: 2, academicYear: '2025-2026', gradedBy: byEmail['teacher1@academic.com']._id },
  ]);

  console.log('Seed termine. Comptes: admin/scolarite/student/teacher avec password123.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
