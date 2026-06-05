import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  AdminPanelSettings,
  BarChart,
  Brightness4,
  Brightness7,
  Class,
  Close,
  Dashboard,
  Delete,
  Download,
  Edit,
  FactCheck,
  Groups,
  Lock,
  Login,
  Logout,
  Menu,
  Notifications,
  Person,
  PictureAsPdf,
  School,
  Security,
  TableRows,
  WorkspacePremium,
} from '@mui/icons-material';
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import createAppTheme from './theme/theme';
import appLogo from './assets/logo-vert.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const drawerWidth = 280;
const LOCAL_DATA_KEY = 'academicManagement.localData';
const READ_NOTIFICATIONS_KEY = 'academicManagement.readNotifications';
const phoneFormatHelper = 'Format international: +212612345678, +33123456789 ou 00212612345678.';
const levelOptions = ['1AP', '2AP', '3eme Annee', '4eme Annee', '5eme Annee'];
const filiereOptions = ['GC', 'INFO (IIR)', 'Finance', 'Reseaux', 'Automatisme'];

const roles = {
  admin: { label: 'ADMIN', color: 'default' },
  scolarite: { label: 'SCOLARITE', color: 'default' },
  student: { label: 'STUDENT', color: 'success' },
  teacher: { label: 'TEACHER', color: 'default' },
};

const localUsers = [
  { email: 'admin@academic.com', password: 'password123', firstName: 'Admin', lastName: 'Central', role: 'admin' },
  { email: 'scolarite1@academic.com', password: 'password123', firstName: 'Sara', lastName: 'Scolarite', role: 'scolarite' },
  { email: 'student1@academic.com', password: 'password123', firstName: 'Yasmine', lastName: 'Amrani', role: 'student' },
  { email: 'teacher1@academic.com', password: 'password123', firstName: 'Nabil', lastName: 'Bennis', role: 'teacher' },
];

const initialData = {
  students: [
    {
      _id: 'stu-1',
      studentId: 'STU-2026-001',
      firstName: 'Yasmine',
      lastName: 'Amrani',
      email: 'student1@academic.com',
      phone: '+212600000001',
      photo: '',
      diploma: 'dip-1',
      level: '5eme Annee',
      className: 'MBDS',
      filiere: 'INFO (IIR)',
      group: 'A',
      doubleDiplomation: [],
      courses: ['cou-1', 'cou-4'],
      address: { street: '12 Rue Atlas', city: 'Casablanca', state: 'Casablanca-Settat', zipCode: '20000', country: 'Maroc' },
    },
    {
      _id: 'stu-2',
      studentId: 'STU-2026-002',
      firstName: 'Mehdi',
      lastName: 'El Idrissi',
      email: 'mehdi.elidrissi@academic.com',
      phone: '+212600000002',
      photo: '',
      diploma: 'dip-1',
      level: '5eme Annee',
      className: 'MBDS',
      filiere: 'INFO (IIR)',
      group: 'A',
      doubleDiplomation: ['dip-3'],
      courses: ['cou-1', 'cou-2'],
      address: { street: '8 Avenue Hassan II', city: 'Rabat', state: 'Rabat-Sale-Kenitra', zipCode: '10000', country: 'Maroc' },
    },
    {
      _id: 'stu-3',
      studentId: 'STU-2026-003',
      firstName: 'Imane',
      lastName: 'Tazi',
      email: 'imane.tazi@academic.com',
      phone: '+212600000003',
      photo: '',
      diploma: 'dip-2',
      level: '5eme Annee',
      className: 'BI',
      filiere: 'Finance',
      group: 'B',
      doubleDiplomation: [],
      courses: ['cou-2', 'cou-3'],
      address: { street: '21 Boulevard Zerktouni', city: 'Marrakech', state: 'Marrakech-Safi', zipCode: '40000', country: 'Maroc' },
    },
  ],
  teachers: [
    { _id: 'tea-1', teacherId: 'TCH-001', firstName: 'Nabil', lastName: 'Bennis', email: 'teacher1@academic.com', speciality: 'Intelligence Artificielle', phone: '+212600000010', office: 'B204' },
    { _id: 'tea-2', teacherId: 'TCH-002', firstName: 'Leila', lastName: 'Mansouri', email: 'leila.mansouri@academic.com', speciality: 'Cloud Computing', phone: '+212600000011', office: 'A301' },
    { _id: 'tea-3', teacherId: 'TCH-003', firstName: 'Omar', lastName: 'Haddad', email: 'omar.haddad@academic.com', speciality: 'Data Engineering', phone: '+212600000012', office: 'C110' },
  ],
  courses: [
    { _id: 'cou-1', code: 'IA-301', name: 'Intelligence Artificielle', description: "Concepts fondamentaux de l'IA et de l'apprentissage automatique.", syllabus: 'Recherche, ML supervise, reseaux de neurones, evaluation.', prerequisites: 'Algorithmique, statistiques', coefficient: 3, credits: 4, teacher: 'tea-1' },
    { _id: 'cou-2', code: 'BD-302', name: 'Big Data', description: 'Traitement distribue et pipelines de donnees massives.', syllabus: 'Hadoop, Spark, streaming, optimisation.', prerequisites: 'Bases de donnees, Python', coefficient: 3, credits: 4, teacher: 'tea-3' },
    { _id: 'cou-3', code: 'CL-303', name: 'Cloud Computing', description: 'Architecture cloud, conteneurs et deploiement.', syllabus: 'Docker, CI/CD, orchestration, supervision.', prerequisites: 'Linux, reseaux', coefficient: 2, credits: 3, teacher: 'tea-2' },
    { _id: 'cou-4', code: 'SEC-304', name: 'Securite Applicative', description: 'Authentification, roles, securisation API et bonnes pratiques.', syllabus: 'OAuth 2, JWT, OTP, controle acces, audit.', prerequisites: 'Developpement web', coefficient: 2, credits: 3, teacher: 'tea-1' },
  ],
  ues: [
    { _id: 'ue-1', code: 'UE-IA-1', name: 'Data Science et IA', semester: 1, eliminatoryThreshold: 6, diploma: 'dip-1', referentTeacher: 'tea-1', courses: ['cou-1', 'cou-2'] },
    { _id: 'ue-2', code: 'UE-CLOUD-1', name: 'Cloud et Securite', semester: 1, eliminatoryThreshold: 6, diploma: 'dip-1', referentTeacher: 'tea-2', courses: ['cou-3', 'cou-4'] },
    { _id: 'ue-3', code: 'UE-DATA-2', name: 'Ingenierie Decisionnelle', semester: 2, eliminatoryThreshold: 7, diploma: 'dip-2', referentTeacher: 'tea-3', courses: ['cou-2', 'cou-3'] },
  ],
  diplomas: [
    { _id: 'dip-1', code: 'MBDS-2026', name: 'Master Big Data & Smart Computing', description: 'Formation Big Data, IA, Cloud et securite.', duration: 2, ues: ['ue-1', 'ue-2'] },
    { _id: 'dip-2', code: 'BI-2026', name: 'Master Business Intelligence', description: 'Formation data engineering et aide a la decision.', duration: 2, ues: ['ue-3'] },
    { _id: 'dip-3', code: 'IA-2026', name: 'Parcours Intelligence Artificielle', description: 'Double diplomation orientee IA et data science.', duration: 2, ues: ['ue-1'] },
  ],
  grades: [
    { _id: 'gra-1', student: 'stu-1', course: 'cou-1', ue: 'ue-1', value: 15.5, session: 'normal', semester: 1, academicYear: '2025-2026', comment: 'Tres bon travail' },
    { _id: 'gra-2', student: 'stu-1', course: 'cou-2', ue: 'ue-1', value: 13, session: 'normal', semester: 1, academicYear: '2025-2026', comment: 'Solide' },
    { _id: 'gra-3', student: 'stu-1', course: 'cou-3', ue: 'ue-2', value: 11.5, session: 'normal', semester: 1, academicYear: '2025-2026', comment: 'Correct' },
    { _id: 'gra-4', student: 'stu-1', course: 'cou-4', ue: 'ue-2', value: 5.5, session: 'normal', semester: 1, academicYear: '2025-2026', comment: 'Note eliminatoire' },
    { _id: 'gra-5', student: 'stu-2', course: 'cou-1', ue: 'ue-1', value: 12, session: 'normal', semester: 1, academicYear: '2025-2026', comment: '' },
    { _id: 'gra-6', student: 'stu-2', course: 'cou-2', ue: 'ue-1', value: 14, session: 'normal', semester: 1, academicYear: '2025-2026', comment: '' },
    { _id: 'gra-7', student: 'stu-3', course: 'cou-2', ue: 'ue-3', value: 16, session: 'normal', semester: 2, academicYear: '2025-2026', comment: '' },
  ],
  notifications: [
    { _id: 'not-1', channel: 'email', recipient: 'student1@academic.com', recipientRole: 'student', subject: 'Bienvenue', message: 'Votre compte academique est pret.', status: 'dev' },
  ],
};

function loadStoredData() {
  try {
    const saved = localStorage.getItem(LOCAL_DATA_KEY);
    if (!saved) return initialData;

    const parsed = JSON.parse(saved);
    return {
      ...initialData,
      ...parsed,
    };
  } catch {
    return initialData;
  }
}

const navItems = [
  { key: 'dashboard', label: 'Tableau de bord', icon: <Dashboard />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
  { key: 'profile', label: 'Profil', icon: <Person />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
  { key: 'students', label: 'Etudiants', icon: <Groups />, roles: ['admin', 'scolarite', 'teacher'] },
  { key: 'courses', label: 'Matieres', icon: <Class />, roles: ['admin', 'scolarite', 'teacher'] },
  { key: 'ues', label: 'UE', icon: <School />, roles: ['admin', 'teacher'] },
  { key: 'diplomas', label: 'Diplomes', icon: <WorkspacePremium />, roles: ['admin'] },
  { key: 'teachers', label: 'Professeurs', icon: <AdminPanelSettings />, roles: ['admin', 'scolarite'] },
  { key: 'grades', label: 'Notes', icon: <FactCheck />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
  { key: 'notifications', label: 'Notifications', icon: <Notifications />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
  { key: 'security', label: 'Securite', icon: <Security />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
];

const roleCapabilities = {
  admin: ['Lecture/ecriture complete', 'Gestion comptes', 'Toutes les statistiques', 'Toutes les validations'],
  scolarite: ['Etudiants', 'Matieres', 'Saisie notes', 'Profils et inscriptions'],
  student: ['Notes personnelles', 'Progression', 'Validation UE/diplome'],
  teacher: ['UE referencees', 'Matieres enseignees', 'Suivi pedagogique'],
};

function apiClient(token) {
  return axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

function normalizeCollection(entity, values) {
  if (!Array.isArray(values)) return [];

  // L'API renvoie souvent des objets peuples par MongoDB; le front garde des ids simples pour les formulaires.
  return values.map((item) => {
    if (entity === 'students') {
      return {
        ...item,
        firstName: item.firstName || item.user?.firstName || '',
        lastName: item.lastName || item.user?.lastName || '',
        email: item.email || item.user?.email || '',
        diploma: item.diploma?._id || item.diploma || '',
        doubleDiplomation: (item.doubleDiplomation || []).map((diploma) => diploma?._id || diploma),
        courses: (item.courses || []).map((course) => course?._id || course),
      };
    }
    if (entity === 'teachers') {
      return {
        ...item,
        firstName: item.firstName || item.user?.firstName || '',
        lastName: item.lastName || item.user?.lastName || '',
        email: item.email || item.user?.email || '',
      };
    }
    if (entity === 'courses') {
      return {
        ...item,
        teacher: item.teacher?._id || item.teacher || '',
      };
    }
    if (entity === 'ues') {
      return {
        ...item,
        diploma: item.diploma?._id || item.diploma || '',
        referentTeacher: item.referentTeacher?._id || item.referentTeacher || '',
        courses: (item.courses || []).map((course) => course?._id || course),
      };
    }
    if (entity === 'diplomas') {
      return {
        ...item,
        ues: (item.ues || []).map((ue) => ue?._id || ue),
      };
    }
    if (entity === 'grades') {
      return {
        ...item,
        student: item.student?._id || item.student || '',
        course: item.course?._id || item.course || '',
        ue: item.ue?._id || item.ue || '',
        studentLabel: item.student?.user
          ? `${item.student.user.firstName || ''} ${item.student.user.lastName || ''}`.trim()
          : '',
        courseLabel: item.course?.name || '',
        ueLabel: item.ue ? `${item.ue.code || ''} - ${item.ue.name || ''}`.trim() : '',
      };
    }
    if (entity === 'notifications') {
      return {
        ...item,
        recipientUser: item.recipientUser?._id || item.recipientUser || '',
      };
    }
    return item;
  });
}

function fullName(person) {
  return `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function prepareLocalEntity(entity, item) {
  const suffix = String(Date.now()).slice(-5);

  if (entity === 'students' && !item.studentId) {
    return { ...item, studentId: `STU-LOCAL-${suffix}` };
  }
  if (entity === 'teachers' && !item.teacherId) {
    return { ...item, teacherId: `TCH-LOCAL-${suffix}` };
  }

  return item;
}

function average(values) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length) * 100) / 100;
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const compact = raw.replace(/[\s().-]/g, '');
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
}

function isValidInternationalPhone(value) {
  const normalized = normalizePhone(value);
  return !normalized || /^\+[1-9]\d{7,14}$/.test(normalized);
}

function validateUE(ue, data, studentId) {
  const ueGrades = data.grades.filter((grade) => grade.ue === ue._id && (!studentId || grade.student === studentId));
  const threshold = Number(ue.eliminatoryThreshold || 6);
  const hasEliminatory = ueGrades.some((grade) => Number(grade.value) < threshold);
  const avg = average(ueGrades.map((grade) => grade.value));

  return {
    average: avg,
    hasEliminatory,
    validated: ueGrades.length > 0 && avg >= 10 && !hasEliminatory,
    totalGrades: ueGrades.length,
  };
}

function getEntityName(data, entity, id) {
  if (id && typeof id === 'object') {
    if (entity === 'students' && id.user) return fullName(id.user);
    if (entity === 'teachers' && id.user) return fullName(id.user);
    return id.name || id.code || id._id || 'Non assigne';
  }
  const item = data[entity]?.find((entry) => entry._id === id);
  if (!item) return 'Non assigne';
  if (entity === 'students' || entity === 'teachers') return fullName(item);
  return item.name || item.code || id;
}

function getCurrentStudent(data, user) {
  if (user?.role !== 'student') return null;
  if (user.profile?._id) {
    return normalizeCollection('students', [{ ...user.profile, user }])[0];
  }

  return (
    data.students.find((student) => student.email?.toLowerCase() === user.email?.toLowerCase()) ||
    data.students.find((student) => student.user === user.id || student.user?._id === user.id) ||
    null
  );
}

function getCurrentTeacher(data, user) {
  if (user?.role !== 'teacher') return null;
  if (user.profile?._id) {
    return normalizeCollection('teachers', [{ ...user.profile, user }])[0];
  }

  return (
    data.teachers.find((teacher) => teacher.email?.toLowerCase() === user.email?.toLowerCase()) ||
    data.teachers.find((teacher) => teacher.user === user.id || teacher.user?._id === user.id) ||
    null
  );
}

function mergeCollections(entity, localItems, remoteItems) {
  const remote = normalizeCollection(entity, remoteItems);
  if (remoteItems !== undefined) return remote;
  const remoteIds = new Set(remote.map((item) => item._id));
  const localOnly = (localItems || []).filter((item) => item._id && !remoteIds.has(item._id));
  return [...remote, ...localOnly];
}

function getVisibleNotifications(data, user) {
  const role = user?.role;
  if (!role) return [];
  if (['admin', 'scolarite'].includes(role)) return data.notifications || [];

  // Un etudiant ou un professeur ne voit que ses notifications, sauf les annonces generales.
  return (data.notifications || []).filter((notification) => {
    if (notification.recipientRole === 'all') return true;
    const sameUser = notification.recipientUser && (notification.recipientUser === user.id || notification.recipientUser === user._id);
    const sameEmail = notification.recipient?.toLowerCase?.() === user.email?.toLowerCase?.();
    return notification.recipientRole === role && (sameUser || sameEmail);
  });
}

function safeCsvValue(value) {
  const text = value === undefined || value === null ? '' : String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(safeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => safeCsvValue(row[header])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportEntityCsv(entity, data) {
  const rows = (data[entity] || []).map((item) => {
    if (entity === 'students') {
      return {
        matricule: item.studentId,
        prenom: item.firstName,
        nom: item.lastName,
        email: item.email,
        telephone: item.phone,
        niveau: item.level,
        classe: item.className,
        filiere: item.filiere,
        groupe: item.group,
        ville: item.address?.city,
        diplome: getEntityName(data, 'diplomas', item.diploma),
        doubleDiplomation: (item.doubleDiplomation || []).map((id) => getEntityName(data, 'diplomas', id)).join(' | '),
        cours: (item.courses || []).map((id) => getEntityName(data, 'courses', id)).join(' | '),
      };
    }
    if (entity === 'courses') {
      return {
        code: item.code,
        matiere: item.name,
        professeur: getEntityName(data, 'teachers', item.teacher),
        coefficient: item.coefficient,
        credits: item.credits,
        prerequis: item.prerequisites,
      };
    }
    if (entity === 'ues') {
      return {
        code: item.code,
        ue: item.name,
        diplome: getEntityName(data, 'diplomas', item.diploma),
        professeurReferent: getEntityName(data, 'teachers', item.referentTeacher),
        semestre: item.semester,
        matieres: (item.courses || []).map((id) => getEntityName(data, 'courses', id)).join(' | '),
      };
    }
    if (entity === 'grades') {
      return {
        etudiant: getEntityName(data, 'students', item.student),
        ue: getEntityName(data, 'ues', item.ue),
        matiere: getEntityName(data, 'courses', item.course),
        note: item.value,
        session: item.session,
        annee: item.academicYear,
      };
    }
    if (entity === 'notifications') {
      return {
        canal: item.channel,
        destinataire: item.recipient,
        objet: item.subject,
        statut: item.status,
        message: item.message,
      };
    }
    return item;
  });

  downloadCsv(`${entity}.csv`, rows);
}

function getStudentGrades(data, studentId) {
  return data.grades.filter((grade) => grade.student === studentId);
}

function getCourseAverage(data, courseId) {
  const grades = data.grades.filter((grade) => grade.course === courseId);
  return average(grades.map((grade) => grade.value));
}

function getStudentAverage(data, studentId) {
  return average(getStudentGrades(data, studentId).map((grade) => grade.value));
}

function printStudentReport(student, data) {
  const grades = getStudentGrades(data, student._id);
  const grouped = groupGradesByUE(grades, data);
  const diploma = getEntityName(data, 'diplomas', student.diploma);
  const logoUrl = new URL(appLogo, window.location.origin).href;
  const rows = grouped.map((group) => `
    <h3>${group.ueName}</h3>
    <table>
      <thead><tr><th>Matiere</th><th>Note</th><th>Session</th><th>Appreciation</th></tr></thead>
      <tbody>
        ${group.grades.map((grade) => `
          <tr>
            <td>${getEntityName(data, 'courses', grade.course)}</td>
            <td>${grade.value}/20</td>
            <td>${grade.session}</td>
            <td>${grade.comment || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Moyenne UE: <strong>${group.average}/20</strong></p>
  `).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Bulletin - ${fullName(student)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
          header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #166534; padding-bottom: 16px; }
          img { width: 72px; height: 72px; object-fit: contain; }
          h1 { margin: 0; color: #166534; }
          h2 { margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .summary { margin: 20px 0; padding: 12px; background: #f0fdf4; border-left: 4px solid #166534; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <header>
          <img src="${logoUrl}" alt="Logo" />
          <div>
            <h1>Bulletin de notes</h1>
            <p>Annee academique 2025-2026</p>
          </div>
        </header>
        <h2>${fullName(student)}</h2>
        <p>${student.studentId} - ${student.email} - ${diploma}</p>
        <div class="summary">Moyenne generale: <strong>${getStudentAverage(data, student._id)}/20</strong></div>
        ${rows || '<p>Aucune note saisie pour cet etudiant.</p>'}
        <button onclick="window.print()">Imprimer / enregistrer en PDF</button>
      </body>
    </html>
  `);
  win.document.close();
}

function groupGradesByUE(grades, data) {
  const knownUeGroups = data.ues
    .map((ue) => {
      const ueGrades = grades.filter((grade) => grade.ue === ue._id);
      return {
        ueId: ue._id,
        ueName: `${ue.code} - ${ue.name}`,
        average: average(ueGrades.map((grade) => grade.value)),
        grades: ueGrades.sort((a, b) => getEntityName(data, 'courses', a.course).localeCompare(getEntityName(data, 'courses', b.course))),
      };
    })
    .filter((group) => group.grades.length > 0);

  const groupedGradeIds = new Set(knownUeGroups.flatMap((group) => group.grades.map((grade) => grade._id)));
  const orphanGrades = grades.filter((grade) => !groupedGradeIds.has(grade._id));
  const fallbackGroups = orphanGrades.reduce((groups, grade) => {
    const ueId = grade.ue || 'ue-non-renseignee';
    if (!groups[ueId]) {
      groups[ueId] = {
        ueId,
        ueName: getEntityName(data, 'ues', ueId) === 'Non assigne' ? 'UE associee a la note' : getEntityName(data, 'ues', ueId),
        average: 0,
        grades: [],
      };
    }
    groups[ueId].grades.push(grade);
    return groups;
  }, {});

  return [
    ...knownUeGroups,
    ...Object.values(fallbackGroups).map((group) => ({
      ...group,
      average: average(group.grades.map((grade) => grade.value)),
      grades: group.grades.sort((a, b) => getEntityName(data, 'courses', a.course).localeCompare(getEntityName(data, 'courses', b.course))),
    })),
  ];
}

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(loadStoredData);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Session locale active');
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [loginForm, setLoginForm] = useState({ email: 'admin@academic.com', password: 'password123', otpToken: '' });
  const [validationForm, setValidationForm] = useState({
    token: new URLSearchParams(window.location.search).get('validationToken') || (window.location.pathname.includes('validate-account') ? new URLSearchParams(window.location.search).get('token') || '' : ''),
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [otpSetup, setOtpSetup] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const activeRole = user?.role || 'admin';

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!user?.email) {
      setReadNotificationIds([]);
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '{}');
      setReadNotificationIds(saved[user.email] || []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [user?.email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      setToken(oauthToken);
      setValidationForm({ token: '', newPassword: '', confirmPassword: '' });
      localStorage.setItem('authToken', oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      apiClient(oauthToken)
        .get('/auth/me')
        .then((response) => {
          setUser(response.data.data);
          localStorage.setItem('authUser', JSON.stringify(response.data.data));
          setApiStatus('Connexion SSO reussie');
        })
        .catch(() => setApiStatus('Token SSO recu, profil indisponible'));
    } else if (token && !user) {
      apiClient(token)
        .get('/auth/me')
        .then((response) => {
          setUser(response.data.data);
          localStorage.setItem('authUser', JSON.stringify(response.data.data));
        })
        .catch(() => {
          setToken('');
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      refreshData();
    }
  }, [token, activeRole]);

  const visibleNav = navItems.filter((item) => item.roles.includes(activeRole));

  async function refreshData() {
    if (!token) return;
    setLoading(true);
    const client = apiClient(token);
    const endpoints = {
      students: '/students?limit=100',
      teachers: '/teachers?limit=100',
      courses: '/courses?limit=100',
      ues: '/ues?limit=100',
      diplomas: '/diplomas',
      grades: '/grades?limit=200',
      notifications: '/notifications',
    };

    if (activeRole === 'teacher') {
      endpoints.students = '/teachers/me/students';
      endpoints.teachers = '/teachers/me/profile';
      endpoints.courses = '/teachers/me/courses';
      endpoints.ues = '/teachers/me/ues';
    }

    try {
      const responses = await Promise.allSettled(
        Object.entries(endpoints).map(async ([entity, endpoint]) => {
          const response = await client.get(endpoint);
          return [entity, response.data.data || []];
        })
      );
      let loaded = 0;
      const remoteData = {};
      responses.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [entity, values] = result.value;
          remoteData[entity] = Array.isArray(values) ? values : [values].filter(Boolean);
          loaded += 1;
        }
      });

      setData((current) => {
        const nextData = { ...current };
        Object.entries(remoteData).forEach(([entity, values]) => {
          nextData[entity] = mergeCollections(entity, current[entity], values);
        });
        return nextData;
      });
      setApiStatus(loaded ? `API connectee: ${loaded} modules synchronises` : 'API indisponible, donnees locales conservees');
    } catch {
      setApiStatus('API indisponible, donnees locales conservees');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient().post('/auth/login', loginForm);
      const auth = response.data.data;
      setToken(auth.token);
      setUser(auth.user);
      localStorage.setItem('authToken', auth.token);
      localStorage.setItem('authUser', JSON.stringify(auth.user));
      setApiStatus('Connexion API reussie');
    } catch (error) {
      const localAccount = localUsers.find(
        (candidate) => candidate.email === loginForm.email && candidate.password === loginForm.password
      );
      if (!localAccount) {
        setApiStatus(error.response?.data?.message || 'Identifiants invalides');
      } else {
        const localUser = { id: localAccount.role === 'student' ? 'stu-1' : localAccount.role === 'teacher' ? 'tea-1' : 'local-user', email: localAccount.email, firstName: localAccount.firstName, lastName: localAccount.lastName, role: localAccount.role, otpEnabled: false };
        setUser(localUser);
        setToken('');
        localStorage.setItem('authUser', JSON.stringify(localUser));
        localStorage.removeItem('authToken');
        setApiStatus('Connecte en session locale');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateAccount(event) {
    event.preventDefault();

    if (!validationForm.token || !validationForm.newPassword || validationForm.newPassword !== validationForm.confirmPassword) {
      setApiStatus('Token et mots de passe identiques requis');
      return;
    }

    setLoading(true);
    try {
      await apiClient().post('/auth/validate-account', {
        token: validationForm.token,
        newPassword: validationForm.newPassword,
      });
      setApiStatus('Compte valide. Vous pouvez vous connecter.');
      setValidationForm({ token: '', newPassword: '', confirmPassword: '' });
      window.history.replaceState({}, document.title, window.location.pathname === '/validate-account' ? '/' : window.location.pathname);
    } catch (error) {
      setApiStatus(error.response?.data?.message || 'Validation impossible');
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstPasswordChange(event) {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setApiStatus('Mot de passe actuel et confirmation correcte requis');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setApiStatus('Le nouveau mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await apiClient(token).post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setApiStatus('Mot de passe mis a jour');
    } catch (error) {
      setApiStatus(error.response?.data?.message || 'Changement de mot de passe impossible');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    setView('dashboard');
    setValidationForm({ token: '', newPassword: '', confirmPassword: '' });
    window.history.replaceState({}, document.title, '/');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  function markNotificationsAsRead(notifications) {
    if (!user?.email || !notifications.length) return;
    const ids = notifications.map((notification) => notification._id).filter(Boolean);
    const nextIds = [...new Set([...readNotificationIds, ...ids])];
    setReadNotificationIds(nextIds);

    // La lecture est locale au compte connecte: ouvrir la cloche suffit pour remettre le badge a zero.
    try {
      const saved = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '{}');
      saved[user.email] = nextIds;
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(saved));
    } catch {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify({ [user.email]: nextIds }));
    }
  }

  function openDialog(entity, item = null) {
    setDialog({ entity, id: item?._id || null });
    setForm(item ? flattenItem(entity, item) : getEmptyForm(entity));
    setFormErrors({});
  }

  function closeDialog() {
    setDialog(null);
    setForm({});
    setFormErrors({});
  }

  async function saveEntity() {
    const entity = dialog.entity;
    if (entity === 'notifications' && !token) {
      setFormErrors({ message: 'Connectez-vous avec le backend pour envoyer une notification.' });
      setApiStatus('Session locale: SMS/email non envoyes');
      return;
    }

    const errors = validateForm(entity, form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setApiStatus('Veuillez completer les champs obligatoires');
      return;
    }

    const payload = inflateItem(entity, form);
    const id = dialog.id;
    const endpoint = entityEndpoints[entity];
    let saved = prepareLocalEntity(entity, { ...payload, _id: id || makeId(entity.slice(0, 3)) });

    if (token && endpoint) {
      try {
        const client = apiClient(token);
        const response = id ? await client.put(`${endpoint}/${id}`, payload) : await client.post(endpoint, payload);
        saved = normalizeCollection(entity, [response.data.data])[0];
        if (['students', 'teachers'].includes(entity) && payload.photo && !saved.photo) {
          saved.photo = payload.photo;
        }
        if (response.data.validation) {
          const { temporaryPassword, validationLink } = response.data.validation;
          setApiStatus(`Compte cree. Mot de passe temporaire: ${temporaryPassword} | Lien: ${validationLink}`);
        } else if (entity === 'notifications') {
          setApiStatus(`Notification ${saved.status || 'enregistree'}: ${saved.deliveryDetail || 'historique mis a jour'}`);
          refreshData();
        } else {
          setApiStatus('Modification synchronisee avec API');
        }
      } catch (error) {
        setApiStatus(error.response?.data?.message || 'Modification non enregistree dans la base');
        return;
      }
    }

    setData((current) => ({
      ...current,
      [entity]: id
        ? current[entity].map((item) => (item._id === id ? { ...item, ...saved } : item))
        : [{ ...saved }, ...current[entity]],
    }));
    if (!token) {
      setApiStatus('Enregistre dans ce navigateur');
    }
    closeDialog();
  }

  async function deleteEntity(entity, id) {
    if (token && entityEndpoints[entity]) {
      try {
        await apiClient(token).delete(`${entityEndpoints[entity]}/${id}`);
        setApiStatus('Suppression synchronisee avec API');
      } catch (error) {
        setApiStatus(error.response?.data?.message || 'API indisponible, suppression locale uniquement');
      }
    }
    setData((current) => ({ ...current, [entity]: current[entity].filter((item) => item._id !== id) }));
  }

  async function saveProfile(payload) {
    setLoading(true);
    let updatedUser = {
      ...user,
      firstName: payload.firstName,
      lastName: payload.lastName,
      profile: { ...(user.profile || {}), ...payload },
    };

    if (token) {
      try {
        const response = await apiClient(token).put('/auth/profile', payload);
        updatedUser = response.data.data;
        setApiStatus('Profil synchronise avec API');
      } catch (error) {
        setApiStatus(error.response?.data?.message || 'Profil garde en local');
      }
    } else {
      setApiStatus('Profil enregistre dans ce navigateur');
    }

    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));

    setData((current) => {
      if (!updatedUser.profile || !['student', 'teacher'].includes(updatedUser.role)) return current;
      const entity = updatedUser.role === 'student' ? 'students' : 'teachers';
      const normalized = normalizeCollection(entity, [{ ...updatedUser.profile, user: updatedUser }])[0];
      const exists = current[entity].some((item) => item._id === normalized._id);

      return {
        ...current,
        [entity]: exists
          ? current[entity].map((item) => (item._id === normalized._id ? { ...item, ...normalized } : item))
          : [normalized, ...current[entity]],
      };
    });
    setLoading(false);
  }

  if (!user && (validationForm.token || window.location.pathname.includes('validate-account'))) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 3 }}>
          <Card sx={{ width: '100%', maxWidth: 520 }}>
            <CardContent>
              <Stack spacing={2.5} component="form" onSubmit={handleValidateAccount}>
                <Box component="img" src={appLogo} alt="Logo" sx={{ width: 96, height: 96, objectFit: 'contain' }} />
                <Box>
                  <Typography variant="h4">Validation du compte</Typography>
                  <Typography color="text.secondary">Choisissez votre mot de passe pour activer le compte.</Typography>
                </Box>
                <TextField label="Token de validation" required value={validationForm.token} onChange={(event) => setValidationForm({ ...validationForm, token: event.target.value })} fullWidth />
                <TextField label="Nouveau mot de passe" type="password" required value={validationForm.newPassword} onChange={(event) => setValidationForm({ ...validationForm, newPassword: event.target.value })} fullWidth />
                <TextField label="Confirmer le mot de passe" type="password" required value={validationForm.confirmPassword} onChange={(event) => setValidationForm({ ...validationForm, confirmPassword: event.target.value })} fullWidth />
                <Button type="submit" variant="contained" disabled={loading}>Valider le compte</Button>
                <Typography variant="caption" color="text.secondary">{apiStatus}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.default' }}>
          <Box sx={{ p: { xs: 3, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack spacing={3} sx={{ maxWidth: 560 }}>
              <Box
                component="button"
                type="button"
                onClick={() => setView('dashboard')}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  p: 0,
                  height: 96,
                  width: 96,
                  cursor: 'pointer',
                }}
              >
                <Box component="img" src={appLogo} alt="Logo" sx={{ width: '200%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ mb: 1 }}>Gestion academique</Typography>
                <Typography color="text.secondary">Un tableau de bord simple pour suivre les etudiants, les cours et les notes.</Typography>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ p: { xs: 3, md: 8 }, display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }}>
            <Card sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
              <CardContent>
                <Stack spacing={2.5} component="form" onSubmit={handleLogin}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Connexion</Typography>
                    <Tooltip title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}>
                      <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
                        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <TextField label="Email" type="email" required value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} fullWidth />
                  <TextField label="Mot de passe" type="password" required value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} fullWidth />
                  <TextField label="Code OTP si active" value={loginForm.otpToken} onChange={(event) => setLoginForm({ ...loginForm, otpToken: event.target.value })} fullWidth />
                  <Button type="submit" variant="contained" startIcon={<Login />} disabled={loading}>Se connecter</Button>
                  <Button
                    href={`${API_URL}/auth/google`}
                    fullWidth
                    sx={{
                      justifyContent: 'center',
                      gap: 1.2,
                      border: 0,
                      color: '#fff',
                      py: 1.25,
                      fontWeight: 800,
                      background: 'linear-gradient(90deg, #166534 0%, #2e7d32 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #115e59 0%, #166534 100%)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#fff', fontWeight: 900, color: '#166534' }}>
                      G
                    </Box>
                    Continuer avec Google
                  </Button>
                  <Typography variant="caption" color="text.secondary">{apiStatus}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (user?.mustChangePassword) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 3 }}>
          <Card sx={{ width: '100%', maxWidth: 520 }}>
            <CardContent>
              <Stack spacing={2.5} component="form" onSubmit={handleFirstPasswordChange}>
                <Box component="img" src={appLogo} alt="Logo" sx={{ width: 96, height: 96, objectFit: 'contain' }} />
                <Box>
                  <Typography variant="h4">Changer le mot de passe</Typography>
                  <Typography color="text.secondary">
                    Pour finir l'activation du compte, remplacez le mot de passe temporaire.
                  </Typography>
                </Box>
                <TextField
                  label="Mot de passe temporaire"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  fullWidth
                />
                <TextField
                  label="Nouveau mot de passe"
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  fullWidth
                />
                <TextField
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button type="submit" variant="contained" disabled={loading || !token}>Mettre a jour</Button>
                  <Button onClick={logout}>Se deconnecter</Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">{apiStatus}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Box
          component="button"
          type="button"
          onClick={() => {
            setView('dashboard');
            setMobileOpen(false);
          }}
          sx={{ border: 0, bgcolor: 'transparent', p: 0, cursor: 'pointer' }}
        >
          <Box component="img" src={appLogo} alt="Logo" sx={{ width: 64, height: 64, objectFit: 'contain' }} />
        </Box>
        <Box>
          <Typography variant="h6">Miage Notes</Typography>
          <Typography variant="caption" color="text.secondary">Gestion des donnees</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {visibleNav.map((item) => (
          <ListItemButton
            key={item.key}
            selected={view === item.key}
            onClick={() => {
              setView(item.key);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Role connecte</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Chip label={roles[activeRole].label} color={roles[activeRole].color} size="small" />
              <Typography variant="body2">{fullName(user)}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
  const visibleNotifications = getVisibleNotifications(data, user);
  const unreadNotifications = visibleNotifications.filter((notification) => !readNotificationIds.includes(notification._id));
  const latestNotifications = visibleNotifications.slice(0, 3);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <Menu />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{navItems.find((item) => item.key === view)?.label || 'Dashboard'}</Typography>
              <Typography variant="caption" color="text.secondary">{apiStatus}</Typography>
            </Box>
            <Tooltip title="Notifications">
              <IconButton onClick={(event) => {
                setNotificationAnchor(event.currentTarget);
                markNotificationsAsRead(visibleNotifications);
              }}>
                <Badge color="error" badgeContent={unreadNotifications.length} invisible={!unreadNotifications.length}>
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}>
              <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Se deconnecter">
              <IconButton onClick={logout}><Logout /></IconButton>
            </Tooltip>
          </Toolbar>
          {loading && <LinearProgress />}
        </AppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
            {drawer}
          </Drawer>
          <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }} open>
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, p: { xs: 2, md: 3 }, mt: 8 }}>
          {view === 'dashboard' && <DashboardView data={data} role={activeRole} user={user} />}
          {view === 'profile' && <ProfileView data={data} user={user} onSave={saveProfile} apiStatus={apiStatus} />}
          {view === 'students' && <EntityView entity="students" title="Etudiants" data={data} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} role={activeRole} user={user} />}
          {view === 'courses' && <EntityView entity="courses" title="Matieres" data={data} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} role={activeRole} user={user} />}
          {view === 'ues' && <EntityView entity="ues" title="Unites d'enseignement" data={data} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} role={activeRole} user={user} />}
          {view === 'diplomas' && <EntityView entity="diplomas" title="Diplomes" data={data} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} role={activeRole} user={user} />}
          {view === 'teachers' && <EntityView entity="teachers" title="Professeurs" data={data} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} role={activeRole} user={user} />}
          {view === 'grades' && <GradesView data={data} role={activeRole} user={user} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} />}
          {view === 'notifications' && <NotificationsView data={{ ...data, notifications: visibleNotifications }} role={activeRole} onAdd={openDialog} onEdit={openDialog} onDelete={deleteEntity} />}
          {view === 'security' && (
            <SecurityView
              token={token}
              user={user}
              setUser={setUser}
              apiStatus={apiStatus}
              setApiStatus={setApiStatus}
              otpSetup={otpSetup}
              setOtpSetup={setOtpSetup}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
            />
          )}
        </Box>
      </Box>
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 340, maxWidth: 'calc(100vw - 32px)', p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Notifications</Typography>
            <Button
              size="small"
              onClick={() => {
                setView('notifications');
                setNotificationAnchor(null);
              }}
            >
              Historique
            </Button>
          </Stack>
          <Stack spacing={1}>
            {latestNotifications.length ? latestNotifications.map((notification) => (
              <Box key={notification._id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2">{notification.subject || 'Notification'}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{notification.message}</Typography>
              </Box>
            )) : (
              <Typography variant="body2" color="text.secondary">Aucune notification recue.</Typography>
            )}
          </Stack>
        </Box>
      </Popover>
      <EntityDialog
        dialog={dialog}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        data={data}
        onClose={closeDialog}
        onSave={saveEntity}
      />
    </ThemeProvider>
  );
}

const entityEndpoints = {
  students: '/students',
  teachers: '/teachers',
  courses: '/courses',
  ues: '/ues',
  diplomas: '/diplomas',
  grades: '/grades',
  notifications: '/notifications',
};

function DashboardView({ data, role, user }) {
  const currentStudent = getCurrentStudent(data, user);
  const currentTeacher = getCurrentTeacher(data, user);
  const teacherCourseIds = role === 'teacher'
    ? data.courses
        .filter((course) => !currentTeacher || course.teacher === currentTeacher._id)
        .map((course) => course._id)
    : [];
  const studentId = role === 'student' ? currentStudent?._id : null;
  const grades = studentId
    ? data.grades.filter((grade) => grade.student === studentId)
    : role === 'teacher'
      ? data.grades.filter((grade) => teacherCourseIds.includes(grade.course))
      : data.grades;
  const scopedStudents = data.students;
  const scopedCourses = role === 'teacher'
    ? data.courses.filter((course) => teacherCourseIds.includes(course._id))
    : data.courses;
  const avg = average(grades.map((grade) => grade.value));
  const ueStats = data.ues.map((ue) => ({ name: ue.code, ...validateUE(ue, data, studentId) }));
  const validated = ueStats.filter((ue) => ue.validated).length;
  const counts = [
    { label: 'Etudiants', value: scopedStudents.length, icon: <Groups />, roles: ['admin', 'scolarite', 'teacher'] },
    { label: 'Matieres', value: scopedCourses.length, icon: <Class />, roles: ['admin', 'scolarite', 'teacher'] },
    { label: 'UE', value: data.ues.length, icon: <School />, roles: ['admin', 'teacher'] },
    { label: 'Diplomes', value: data.diplomas.length, icon: <WorkspacePremium />, roles: ['admin'] },
    { label: 'Professeurs', value: data.teachers.length, icon: <AdminPanelSettings />, roles: ['admin', 'scolarite'] },
    { label: 'Moyenne', value: avg, icon: <BarChart />, roles: ['admin', 'scolarite', 'student', 'teacher'] },
  ].filter((item) => item.roles.includes(role));

  const gradeDistribution = [
    { name: '< 6', value: grades.filter((grade) => grade.value < 6).length },
    { name: '6-10', value: grades.filter((grade) => grade.value >= 6 && grade.value < 10).length },
    { name: '10-14', value: grades.filter((grade) => grade.value >= 10 && grade.value < 14).length },
    { name: '14+', value: grades.filter((grade) => grade.value >= 14).length },
  ];
  const courseAverages = scopedCourses.map((course) => ({
    course: course.code,
    name: course.name,
    average: getCourseAverage(data, course._id),
  }));
  const ranking = scopedStudents
    .map((student) => ({ student, average: getStudentAverage(data, student._id) }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Bonjour {user.firstName}</Typography>
        <Typography color="text.secondary">Vue dynamique adaptee au profil {roles[role].label}.</Typography>
      </Box>
      <Grid container spacing={2}>
        {counts.map((item) => (
          <Grid item xs={12} sm={6} lg={4} key={item.label}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{item.icon}</Avatar>
                  <Box>
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography variant="h4">{item.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Validation des UE</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <ReBarChart data={ueStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 20]} />
                    <ChartTooltip />
                    <Bar dataKey="average" name="Moyenne">
                      {ueStats.map((entry) => <Cell key={entry.name} fill={entry.validated ? '#2e7d32' : entry.hasEliminatory ? '#d32f2f' : '#ed6c02'} />)}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Repartition des notes</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={gradeDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                      {['#d32f2f', '#ed6c02', '#6b7280', '#2e7d32'].map((color) => <Cell key={color} fill={color} />)}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {validated}/{ueStats.length} UE validees selon moyenne superieure ou egale a 10 et aucune note eliminatoire.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Moyennes par cours</Typography>
              <Stack spacing={1.5}>
                {courseAverages.map((item) => (
                  <Stack key={item.course} direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 86 }}>
                      <Typography variant="body2" fontWeight={700}>{item.course}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={Math.min(item.average * 5, 100)} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                    <Typography variant="body2" sx={{ width: 54, textAlign: 'right' }}>{item.average}/20</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Classement des etudiants</Typography>
              <Stack spacing={1}>
                {ranking.map((item, index) => (
                  <Stack key={item.student._id} direction="row" alignItems="center" spacing={2}>
                    <Chip label={`#${index + 1}`} size="small" color={index === 0 ? 'success' : 'default'} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{fullName(item.student)}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.student.studentId}</Typography>
                    </Box>
                    <Typography variant="body2">{item.average}/20</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function ProfileView({ data, user, onSave, apiStatus }) {
  const sourceProfile =
    user.profile ||
    (user.role === 'student' ? getCurrentStudent(data, user) : null) ||
    (user.role === 'teacher' ? getCurrentTeacher(data, user) : null) ||
    {};
  const initialForm = {
    firstName: user.firstName || sourceProfile.firstName || '',
    lastName: user.lastName || sourceProfile.lastName || '',
    email: user.email || sourceProfile.email || '',
    phone: sourceProfile.phone || '',
    photo: sourceProfile.photo || '',
    speciality: sourceProfile.speciality || '',
    office: sourceProfile.office || '',
    level: sourceProfile.level || '',
    className: sourceProfile.className || '',
    filiere: sourceProfile.filiere || '',
    group: sourceProfile.group || '',
    street: sourceProfile.address?.street || '',
    city: sourceProfile.address?.city || '',
    state: sourceProfile.address?.state || '',
    zipCode: sourceProfile.address?.zipCode || '',
    country: sourceProfile.address?.country || 'Maroc',
  };
  const [profileForm, setProfileForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setProfileForm(initialForm);
  }, [user.email, sourceProfile?._id]);

  const updateField = (name, value) => {
    setProfileForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const updatePhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const submitProfile = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!profileForm.firstName.trim()) nextErrors.firstName = 'Ce champ est obligatoire';
    if (!profileForm.lastName.trim()) nextErrors.lastName = 'Ce champ est obligatoire';
    if (!isValidInternationalPhone(profileForm.phone)) nextErrors.phone = phoneFormatHelper;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: normalizePhone(profileForm.phone),
      photo: profileForm.photo,
      speciality: profileForm.speciality,
      office: profileForm.office,
      level: profileForm.level,
      className: profileForm.className,
      filiere: profileForm.filiere,
      group: profileForm.group,
      address: {
        street: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zipCode: profileForm.zipCode,
        country: profileForm.country || 'Maroc',
      },
    });
  };

  return (
    <Stack spacing={2} component="form" onSubmit={submitProfile}>
      <Box>
        <Typography variant="h4">Mon profil</Typography>
        <Typography color="text.secondary">Modifiez vos informations personnelles et votre photo.</Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Avatar src={profileForm.photo || undefined} sx={{ width: 120, height: 120, fontSize: 40 }}>
                  {profileForm.firstName?.charAt(0) || 'P'}
                </Avatar>
                {['student', 'teacher'].includes(user.role) && (
                  <Button variant="outlined" component="label">
                    Modifier la photo
                    <input hidden type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(event) => updatePhoto(event.target.files?.[0])} />
                  </Button>
                )}
                <Chip label={roles[user.role]?.label || user.role} color={roles[user.role]?.color || 'default'} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Prenom" required fullWidth value={profileForm.firstName} error={Boolean(errors.firstName)} helperText={errors.firstName || ''} onChange={(event) => updateField('firstName', event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Nom" required fullWidth value={profileForm.lastName} error={Boolean(errors.lastName)} helperText={errors.lastName || ''} onChange={(event) => updateField('lastName', event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" fullWidth value={profileForm.email} disabled helperText="L'email sert a relier le compte SSO aux donnees academiques." />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Telephone" fullWidth value={profileForm.phone} error={Boolean(errors.phone)} helperText={errors.phone || phoneFormatHelper} onChange={(event) => updateField('phone', event.target.value)} />
                </Grid>

                {user.role === 'teacher' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Specialite" fullWidth value={profileForm.speciality} onChange={(event) => updateField('speciality', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Bureau" fullWidth value={profileForm.office} onChange={(event) => updateField('office', event.target.value)} />
                    </Grid>
                  </>
                )}

                {user.role === 'student' && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField select label="Niveau" fullWidth value={profileForm.level} onChange={(event) => updateField('level', event.target.value)}>
                        <MenuItem value="">Non renseigne</MenuItem>
                        {levelOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Classe" fullWidth value={profileForm.className} onChange={(event) => updateField('className', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Groupe" fullWidth value={profileForm.group} onChange={(event) => updateField('group', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField select label="Filiere" fullWidth value={profileForm.filiere} onChange={(event) => updateField('filiere', event.target.value)}>
                        <MenuItem value="">Non renseignee</MenuItem>
                        {filiereOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Adresse" fullWidth value={profileForm.street} onChange={(event) => updateField('street', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Ville" fullWidth value={profileForm.city} onChange={(event) => updateField('city', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Region" fullWidth value={profileForm.state} onChange={(event) => updateField('state', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Code postal" fullWidth value={profileForm.zipCode} onChange={(event) => updateField('zipCode', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Pays" fullWidth value={profileForm.country} onChange={(event) => updateField('country', event.target.value)} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
        <Typography variant="body2" color="text.secondary">{apiStatus}</Typography>
        <Button type="submit" variant="contained" startIcon={<Edit />}>Enregistrer le profil</Button>
      </Stack>
    </Stack>
  );
}

function EntityView({ entity, title, data, onAdd, onEdit, onDelete, role, user }) {
  const currentTeacher = getCurrentTeacher(data, user);
  const items = role === 'teacher' && entity === 'courses'
    ? (currentTeacher ? data.courses.filter((course) => course.teacher === currentTeacher._id) : data.courses)
    : data[entity];

  const canWrite = role === 'admin' || role === 'scolarite' || (role === 'teacher' && ['courses', 'ues'].includes(entity));
  const canDelete = role === 'admin' || (role === 'scolarite' && ['notifications'].includes(entity));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{items.length} element(s) dans le module.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={() => exportEntityCsv(entity, data)}>CSV</Button>
          {canWrite && <Button variant="contained" startIcon={<Add />} onClick={() => onAdd(entity)}>Ajouter</Button>}
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} md={6} xl={4} key={item._id}>
            <EntityCard entity={entity} item={item} data={data} canWrite={canWrite} canDelete={canDelete} onEdit={onEdit} onDelete={onDelete} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function EntityCard({ entity, item, data, canWrite, canDelete, onEdit, onDelete }) {
  const title = entity === 'students' || entity === 'teachers'
    ? fullName(item)
    : entity === 'notifications'
        ? `${item.channel?.toUpperCase() || 'NOTIFICATION'} - ${item.recipient}`
        : item.name;
  const subtitle = item.code || item.studentId || item.teacherId || item.email || item.academicYear || item.subject || item.status;
  const chips = getChips(entity, item, data);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Avatar src={item.photo || undefined} sx={{ bgcolor: 'primary.main' }}>{title?.charAt(0)}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap>{title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{subtitle}</Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              {canWrite && <Tooltip title="Modifier"><IconButton size="small" onClick={() => onEdit(entity, item)}><Edit fontSize="small" /></IconButton></Tooltip>}
              {canDelete && <Tooltip title="Supprimer"><IconButton size="small" color="error" onClick={() => onDelete(entity, item._id)}><Delete fontSize="small" /></IconButton></Tooltip>}
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary">{getDescription(entity, item, data)}</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {chips.map((chip) => <Chip key={chip} label={chip} size="small" />)}
          </Stack>
          {entity === 'students' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf />}
              onClick={() => printStudentReport(item, data)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Bulletin
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function GradesView({ data, role, user, onAdd, onEdit, onDelete }) {
  const currentStudent = getCurrentStudent(data, user);
  const currentTeacher = getCurrentTeacher(data, user);
  const teacherCourseIds = role === 'teacher'
    ? data.courses
        .filter((course) => !currentTeacher || course.teacher === currentTeacher._id)
        .map((course) => course._id)
    : [];
  const rows = role === 'student' && currentStudent
    ? data.grades.filter((grade) => grade.student === currentStudent._id)
    : role === 'teacher'
      ? data.grades.filter((grade) => teacherCourseIds.includes(grade.course))
      : role === 'student'
        ? data.grades
        : data.grades;
  const groupedRows = groupGradesByUE(rows, data);
  const chartRows = groupedRows.map((group) => ({ name: group.ueName.split(' - ')[0], note: group.average }));
  const canWrite = ['admin', 'scolarite', 'teacher'].includes(role);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4">Notes</Typography>
          <Typography color="text.secondary">{role === 'student' ? `Bulletin personnel de ${user.firstName}` : 'Notes rangees par UE et matieres.'}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={() => exportEntityCsv('grades', data)}>CSV</Button>
          {role === 'student' && currentStudent && (
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => printStudentReport(currentStudent, data)}>Bulletin</Button>
          )}
          {canWrite && <Button variant="contained" startIcon={<Add />} onClick={() => onAdd('grades')}>Saisir une note</Button>}
        </Stack>
      </Stack>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Moyenne par UE</Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 20]} />
                <ChartTooltip />
                <Line dataKey="note" stroke="#166534" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      <Stack spacing={2}>
        {groupedRows.map((group) => (
          <Card key={group.ueId}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                  <Box>
                    <Typography variant="h6">{group.ueName}</Typography>
                    <Typography variant="body2" color="text.secondary">{group.grades.length} note(s) saisie(s)</Typography>
                  </Box>
                  <Chip label={`Moyenne ${group.average}/20`} color={group.average < 10 ? 'warning' : 'success'} />
                </Stack>
                <Divider />
                {group.grades.map((grade) => (
                  <Stack key={grade._id} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{getEntityName(data, 'courses', grade.course)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getEntityName(data, 'students', grade.student)} - {grade.academicYear}
                      </Typography>
                    </Box>
                    <Chip label={`${grade.value}/20`} color={grade.value < 6 ? 'error' : grade.value < 10 ? 'warning' : 'success'} />
                    <Chip label={grade.session} variant="outlined" />
                    {canWrite && <IconButton onClick={() => onEdit('grades', grade)}><Edit /></IconButton>}
                    {role === 'admin' && <IconButton color="error" onClick={() => onDelete('grades', grade._id)}><Delete /></IconButton>}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
        {!groupedRows.length && (
          <Card>
            <CardContent>
              <Typography color="text.secondary">Aucune note trouvee.</Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Stack>
  );
}

function NotificationsView({ data, role, onAdd, onEdit, onDelete }) {
  const canCreate = ['admin', 'scolarite'].includes(role);
  const notifications = [...(data.notifications || [])].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const getStatusColor = (status) => {
    if (['failed', 'undelivered'].includes(status)) return 'error';
    if (status === 'queued') return 'warning';
    if (['sent', 'delivered'].includes(status)) return 'success';
    return 'default';
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4">Notifications</Typography>
          <Typography color="text.secondary">
            Historique des emails/SMS envoyes aux STUDENT et TEACHER.
          </Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" startIcon={<Add />} onClick={() => onAdd('notifications')}>
            Nouvelle notification
          </Button>
        )}
      </Stack>

      <Card sx={{ borderLeft: '5px solid', borderLeftColor: 'primary.main' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Dernieres notifications</Typography>
              <Typography color="text.secondary">Les messages recents restent visibles ici comme une barre d'activite.</Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {notifications.slice(0, 4).map((notification) => (
                <Chip key={notification._id} icon={<Notifications />} label={notification.subject || notification.recipient} color={getStatusColor(notification.status) === 'default' ? 'primary' : getStatusColor(notification.status)} variant="outlined" />
              ))}
              {!notifications.length && <Chip label="Aucune notification" variant="outlined" />}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        {notifications.map((notification) => (
          <Card key={notification._id}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Avatar sx={{ bgcolor: notification.channel === 'sms' ? 'warning.main' : 'primary.main' }}>
                  {notification.channel === 'sms' ? 'S' : 'E'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="h6">{notification.subject || 'Sans objet'}</Typography>
                    <Chip size="small" label={notification.channel?.toUpperCase()} />
                    <Chip size="small" label={notification.status || 'dev'} color={getStatusColor(notification.status)} variant="outlined" />
                  </Stack>
                  <Typography color="text.secondary">{notification.recipientRole?.toUpperCase()} - {notification.recipient}</Typography>
                  <Typography sx={{ mt: 0.5 }}>{notification.message}</Typography>
                  {notification.deliveryDetail && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                      {notification.deliveryDetail}
                    </Typography>
                  )}
                </Box>
                {canCreate && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton onClick={() => onEdit('notifications', notification)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => onDelete('notifications', notification._id)}><Delete /></IconButton>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

function SecurityView({
  token,
  user,
  setUser,
  apiStatus,
  setApiStatus,
  otpSetup,
  setOtpSetup,
  otpCode,
  setOtpCode,
}) {
  const authenticatedClient = token ? apiClient(token) : null;

  const setupOtp = async () => {
    if (!authenticatedClient) {
      setApiStatus('Connectez-vous avec le backend pour configurer OTP');
      return;
    }

    try {
      const response = await authenticatedClient.post('/auth/otp/setup');
      setOtpSetup(response.data.data);
      setApiStatus('Scannez le QR code puis saisissez le code OTP');
    } catch (error) {
      setApiStatus(error.response?.data?.message || 'Configuration OTP impossible');
    }
  };

  const verifyOtp = async () => {
    if (!authenticatedClient) return;
    try {
      await authenticatedClient.post('/auth/otp/verify', { otpToken: otpCode });
      const updatedUser = { ...user, otpEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setOtpSetup(null);
      setOtpCode('');
      setApiStatus('OTP active');
    } catch (error) {
      setApiStatus(error.response?.data?.message || 'Code OTP invalide');
    }
  };

  const disableOtp = async () => {
    if (!authenticatedClient) return;
    try {
      await authenticatedClient.post('/auth/otp/disable');
      const updatedUser = { ...user, otpEnabled: false };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setOtpSetup(null);
      setOtpCode('');
      setApiStatus('OTP desactive');
    } catch (error) {
      setApiStatus(error.response?.data?.message || 'Desactivation OTP impossible');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Securite et acces</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Stack spacing={1}><Lock color="primary" /><Typography variant="h6">OAuth 2 / SSO</Typography><Typography color="text.secondary">Google est disponible via Passport. Les routes restent protegees par JWT apres connexion.</Typography></Stack></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Stack spacing={1}><Security color="primary" /><Typography variant="h6">OTP</Typography><Typography color="text.secondary">Activation par QR code, verification du code puis demande OTP au prochain login.</Typography></Stack></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Stack spacing={1}><TableRows color="primary" /><Typography variant="h6">RBAC</Typography><Typography color="text.secondary">Les menus et actions suivent les roles ADMIN, SCOLARITE, STUDENT et TEACHER.</Typography></Stack></CardContent></Card>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
              <Box>
                <Typography variant="h6">Authentification OTP</Typography>
                <Typography color="text.secondary">
                  Statut: {user?.otpEnabled ? 'activee' : 'non activee'}
                </Typography>
              </Box>
              {user?.otpEnabled ? (
                <Button variant="outlined" color="error" onClick={disableOtp} disabled={!token}>
                  Desactiver OTP
                </Button>
              ) : (
                <Button variant="contained" onClick={setupOtp} disabled={!token}>
                  Configurer OTP
                </Button>
              )}
            </Stack>
            {!token && (
              <Typography variant="body2" color="text.secondary">
                En session locale, l'OTP est affiche comme fonctionnalite. Pour l'activer vraiment, connecte-toi avec le backend lance.
              </Typography>
            )}
            {otpSetup && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box component="img" src={otpSetup.qrCodeUrl} alt="QR code OTP" sx={{ width: 180, height: 180, border: '1px solid', borderColor: 'divider', borderRadius: 1 }} />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Scanne ce QR code avec Google Authenticator, Microsoft Authenticator ou une application compatible.
                  </Typography>
                  <TextField label="Code OTP" value={otpCode} onChange={(event) => setOtpCode(event.target.value)} />
                  <Button variant="contained" onClick={verifyOtp} disabled={!otpCode.trim()}>
                    Verifier et activer
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Etat de session</Typography>
          <Typography color="text.secondary">{apiStatus}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{token ? 'JWT present dans le navigateur.' : 'Session locale sans JWT.'}</Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

function EntityDialog({ dialog, form, setForm, formErrors, setFormErrors, data, onClose, onSave }) {
  if (!dialog) return null;
  const fields = fieldsByEntity[dialog.entity];
  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };
  const updateFileField = (name, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField(name, reader.result);
    reader.readAsDataURL(file);
  };
  const recipientOptions = () => {
    if (form.recipientRole === 'all') return [];
    const source = form.recipientRole === 'teacher' ? data.teachers : data.students;
    return source.map((person) => ({
      label: form.channel === 'sms'
        ? `${fullName(person)} - ${person.phone || 'telephone non renseigne'}`
        : `${fullName(person)} - ${person.email}`,
      value: person.email,
      phone: person.phone || '',
    }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {dialog.id ? 'Modifier' : 'Ajouter'}
          <IconButton onClick={onClose}><Close /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {fields.map((field) => (
            <Grid item xs={12} md={field.full ? 12 : 6} key={field.name}>
              {field.type === 'multiSelect' ? (
                <FormControl fullWidth required={field.required} error={Boolean(formErrors[field.name])}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    multiple
                    label={field.label}
                    value={Array.isArray(form[field.name]) ? form[field.name] : splitIds(form[field.name])}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    renderValue={(selected) => selected
                      .map((value) => (field.options(data) || []).find((option) => option.value === value)?.label || value)
                      .join(', ')}
                  >
                    {(field.options(data) || []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                  <FormHelperText>{formErrors[field.name] || field.helperText || ''}</FormHelperText>
                </FormControl>
              ) : field.type === 'select' ? (
                <FormControl fullWidth required={field.required} error={Boolean(formErrors[field.name])}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    label={field.label}
                    value={form[field.name] ?? ''}
                    onChange={(event) => {
                      updateField(field.name, event.target.value);
                      if (dialog.entity === 'notifications' && field.name === 'recipientRole') {
                        updateField('recipient', '');
                      }
                    }}
                  >
                    {!field.required && <MenuItem value="">Non renseigne</MenuItem>}
                    {(field.options(data) || []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                  {(formErrors[field.name] || field.helperText) && <FormHelperText>{formErrors[field.name] || field.helperText}</FormHelperText>}
                </FormControl>
              ) : field.type === 'recipient' ? (
                form.recipientRole === 'all' ? (
                  <TextField label={field.label} value="Tous les utilisateurs" disabled fullWidth helperText="Notification generale visible par tous les comptes." />
                ) : (
                  <Autocomplete
                    options={recipientOptions()}
                    value={recipientOptions().find((option) => option.value === form[field.name]) || null}
                    onChange={(_event, option) => updateField(field.name, typeof option === 'string' ? option : option?.value || '')}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        required={field.required}
                        error={Boolean(formErrors[field.name])}
                        helperText={formErrors[field.name] || (form.channel === 'sms'
                          ? 'Choisissez un compte dans la liste. Le SMS partira vers le telephone du profil.'
                          : 'Choisissez un etudiant ou un professeur dans la liste.')}
                        fullWidth
                      />
                    )}
                  />
                )
              ) : field.type === 'file' ? (
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={form[field.name] || undefined} sx={{ width: 56, height: 56 }}>
                      {form.firstName?.charAt(0) || 'E'}
                    </Avatar>
                    <Box>
                      <Button variant="outlined" component="label">
                        Choisir une photo
                        <input
                          hidden
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(event) => updateFileField(field.name, event.target.files?.[0])}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        PNG, JPG ou WEBP
                      </Typography>
                    </Box>
                  </Stack>
                  {formErrors[field.name] && <FormHelperText error>{formErrors[field.name]}</FormHelperText>}
                </Stack>
              ) : (
                <TextField
                  label={field.label}
                  type={field.type || 'text'}
                  value={form[field.name] ?? ''}
                  required={field.required}
                  error={Boolean(formErrors[field.name])}
                  helperText={formErrors[field.name] || field.helperText || ''}
                  multiline={field.multiline}
                  minRows={field.multiline ? 3 : undefined}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  fullWidth
                />
              )}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={onSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
}

const optionMappers = {
  students: (data) => data.students.map((item) => ({ value: item._id, label: `${fullName(item)} (${item.studentId})` })),
  teachers: (data) => data.teachers.map((item) => ({ value: item._id, label: `${fullName(item)} (${item.teacherId})` })),
  courses: (data) => data.courses.map((item) => ({ value: item._id, label: `${item.code} - ${item.name}` })),
  ues: (data) => data.ues.map((item) => ({ value: item._id, label: `${item.code} - ${item.name}` })),
  diplomas: (data) => data.diplomas.map((item) => ({ value: item._id, label: `${item.code} - ${item.name}` })),
  doubleDiplomas: (data) => data.diplomas
    .filter((item) => ['MBDS', 'IA'].some((prefix) => item.code?.toUpperCase().startsWith(prefix)))
    .map((item) => ({ value: item._id, label: `${item.code} - ${item.name}` })),
};

const fieldsByEntity = {
  students: [
    { name: 'firstName', label: 'Prenom', required: true },
    { name: 'lastName', label: 'Nom', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'phone', label: 'Telephone', helperText: phoneFormatHelper },
    { name: 'photo', label: 'Photo', type: 'file' },
    { name: 'diploma', label: 'Diplome', type: 'select', options: optionMappers.diplomas, required: true },
    { name: 'doubleDiplomation', label: 'Double Diplomation', type: 'multiSelect', options: optionMappers.doubleDiplomas, full: true, helperText: 'Optionnel. Choix possibles: MBDS ou IA.' },
    { name: 'courses', label: 'Cours associes', full: true, helperText: 'Relation etudiant-cours. Exemple: cou-1, cou-2' },
    { name: 'level', label: 'Niveau', type: 'select', options: () => levelOptions.map((option) => ({ value: option, label: option })) },
    { name: 'className', label: 'Classe' },
    { name: 'filiere', label: 'Filiere', type: 'select', options: () => filiereOptions.map((option) => ({ value: option, label: option })) },
    { name: 'group', label: 'Groupe' },
    { name: 'street', label: 'Adresse' },
    { name: 'city', label: 'Ville' },
    { name: 'state', label: 'Region' },
    { name: 'zipCode', label: 'Code postal' },
  ],
  teachers: [
    { name: 'firstName', label: 'Prenom', required: true },
    { name: 'lastName', label: 'Nom', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'photo', label: 'Photo', type: 'file' },
    { name: 'speciality', label: 'Specialite', required: true },
    { name: 'phone', label: 'Telephone', helperText: phoneFormatHelper },
    { name: 'office', label: 'Bureau' },
  ],
  courses: [
    { name: 'code', label: 'Code', required: true },
    { name: 'name', label: 'Nom', required: true },
    { name: 'teacher', label: 'Professeur', type: 'select', options: optionMappers.teachers, required: true },
    { name: 'coefficient', label: 'Coefficient', type: 'number', required: true },
    { name: 'credits', label: 'Credits', type: 'number', required: true },
    { name: 'prerequisites', label: 'Pre-requis', full: true },
    { name: 'description', label: 'Description', multiline: true, full: true },
    { name: 'syllabus', label: 'Syllabus', multiline: true, full: true },
  ],
  ues: [
    { name: 'code', label: 'Code', required: true },
    { name: 'name', label: 'Nom', required: true },
    { name: 'diploma', label: 'Diplome', type: 'select', options: optionMappers.diplomas, required: true },
    { name: 'referentTeacher', label: 'Professeur referent', type: 'select', options: optionMappers.teachers, required: true },
    { name: 'semester', label: 'Semestre', type: 'number', required: true },
    { name: 'eliminatoryThreshold', label: 'Note eliminatoire', type: 'number', required: true },
    { name: 'courses', label: 'Matieres de l UE', full: true, required: true, helperText: 'Exemple: cou-1, cou-2' },
  ],
  diplomas: [
    { name: 'code', label: 'Code', required: true },
    { name: 'name', label: 'Nom', required: true },
    { name: 'duration', label: 'Duree en annees', type: 'number', required: true },
    { name: 'ues', label: 'UE du diplome', required: true, helperText: 'Exemple: ue-1, ue-2' },
    { name: 'description', label: 'Description', multiline: true, full: true },
  ],
  grades: [
    { name: 'student', label: 'Etudiant', type: 'select', options: optionMappers.students, required: true },
    { name: 'course', label: 'Matiere', type: 'select', options: optionMappers.courses, required: true },
    { name: 'ue', label: 'UE', type: 'select', options: optionMappers.ues, required: true },
    { name: 'value', label: 'Note /20', type: 'number', required: true },
    { name: 'session', label: 'Session', type: 'select', options: () => [{ value: 'normal', label: 'Normal' }, { value: 'rattrapage', label: 'Rattrapage' }], required: true },
    { name: 'semester', label: 'Semestre', type: 'number', required: true },
    { name: 'academicYear', label: 'Annee academique', required: true },
    { name: 'comment', label: 'Commentaire', full: true },
  ],
  notifications: [
    { name: 'channel', label: 'Canal', type: 'select', options: () => [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }], required: true },
    { name: 'recipientRole', label: 'Type destinataire', type: 'select', options: () => [{ value: 'student', label: 'STUDENT' }, { value: 'teacher', label: 'TEACHER' }, { value: 'all', label: 'GENERAL' }], required: true },
    { name: 'recipient', label: 'Destinataire', type: 'recipient', required: true },
    { name: 'subject', label: 'Objet' },
    { name: 'message', label: 'Message', multiline: true, full: true, required: true },
  ],
};

function validateForm(entity, values) {
  const errors = {};
  const fields = fieldsByEntity[entity] || [];

  fields.forEach((field) => {
    if (!field.required) return;
    if (entity === 'notifications' && field.name === 'recipient' && values.recipientRole === 'all') return;
    const value = values[field.name];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field.name] = 'Ce champ est obligatoire';
    }
  });

  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Email invalide';
  }

  if (entity === 'notifications' && values.recipientRole !== 'all' && values.recipient && !/^\S+@\S+\.\S+$/.test(values.recipient)) {
    errors.recipient = 'Choisissez un destinataire dans la liste';
  }

  if (['students', 'teachers'].includes(entity) && values.phone && !isValidInternationalPhone(values.phone)) {
    errors.phone = phoneFormatHelper;
  }

  if (entity === 'grades') {
    const note = Number(values.value);
    if (values.value !== undefined && values.value !== '' && (Number.isNaN(note) || note < 0 || note > 20)) {
      errors.value = 'La note doit etre entre 0 et 20';
    }
  }

  ['coefficient', 'credits', 'duration', 'semester'].forEach((fieldName) => {
    if (values[fieldName] !== undefined && values[fieldName] !== '') {
      const numberValue = Number(values[fieldName]);
      if (Number.isNaN(numberValue) || numberValue <= 0) {
        errors[fieldName] = 'La valeur doit etre positive';
      }
    }
  });

  if (values.eliminatoryThreshold !== undefined && values.eliminatoryThreshold !== '') {
    const threshold = Number(values.eliminatoryThreshold);
    if (Number.isNaN(threshold) || threshold < 0 || threshold > 20) {
      errors.eliminatoryThreshold = 'La note eliminatoire doit etre entre 0 et 20';
    }
  }

  return errors;
}

function getEmptyForm(entity) {
  const defaults = {
    students: { country: 'Maroc' },
    courses: { coefficient: 1, credits: 3 },
    ues: { semester: 1, eliminatoryThreshold: 6 },
    diplomas: { duration: 2 },
    grades: { value: 10, session: 'normal', semester: 1, academicYear: '2025-2026' },
    notifications: { channel: 'email', recipientRole: 'student' },
  };
  return defaults[entity] || {};
}

function flattenItem(entity, item) {
  if (entity === 'students') return { ...item, ...(item.address || {}), doubleDiplomation: item.doubleDiplomation || [], courses: (item.courses || []).join(', ') };
  if (entity === 'ues') return { ...item, courses: (item.courses || []).join(', ') };
  if (entity === 'diplomas') return { ...item, ues: (item.ues || []).join(', ') };
  return { ...item };
}

function inflateItem(entity, item) {
  if (entity === 'students') {
    const { street, city, state, zipCode, country, doubleDiplomation, courses, phone, ...rest } = item;
    return {
      ...rest,
      phone: normalizePhone(phone),
      doubleDiplomation: splitIds(doubleDiplomation),
      courses: splitIds(courses),
      address: { street, city, state, zipCode, country: country || 'Maroc' },
    };
  }
  if (entity === 'ues') return { ...item, courses: splitIds(item.courses), semester: Number(item.semester), eliminatoryThreshold: Number(item.eliminatoryThreshold) };
  if (entity === 'diplomas') return { ...item, ues: splitIds(item.ues), duration: Number(item.duration) };
  if (entity === 'courses') return { ...item, coefficient: Number(item.coefficient), credits: Number(item.credits) };
  if (entity === 'grades') return { ...item, value: Number(item.value), semester: Number(item.semester) };
  if (entity === 'teachers') return { ...item, phone: normalizePhone(item.phone) };
  return item;
}

function splitIds(value) {
  if (Array.isArray(value)) return value;
  return String(value || '').split(',').map((entry) => entry.trim()).filter(Boolean);
}

function getChips(entity, item, data) {
  if (entity === 'students') {
    return [
      item.studentId,
      getEntityName(data, 'diplomas', item.diploma),
      ...(item.doubleDiplomation || []).map((id) => `Double: ${getEntityName(data, 'diplomas', id)}`),
      ...(item.courses || []).map((id) => getEntityName(data, 'courses', id)),
      item.level,
      item.className,
      item.filiere,
      item.group,
      item.address?.city,
    ].filter(Boolean);
  }
  if (entity === 'teachers') return [item.teacherId, item.speciality, item.office].filter(Boolean);
  if (entity === 'courses') return [getEntityName(data, 'teachers', item.teacher), `Coef ${item.coefficient}`, `${item.credits} credits`];
  if (entity === 'ues') return [getEntityName(data, 'diplomas', item.diploma), getEntityName(data, 'teachers', item.referentTeacher), `Seuil ${item.eliminatoryThreshold}`];
  if (entity === 'diplomas') return [`${item.duration} ans`, `${item.ues?.length || 0} UE`];
  if (entity === 'notifications') return [item.channel, item.status].filter(Boolean);
  return [];
}

function getDescription(entity, item, data) {
  if (entity === 'students') return `${item.email} - ${item.phone || 'Telephone non renseigne'} - ${item.address?.street || 'Adresse non renseignee'}`;
  if (entity === 'teachers') return `${item.email} - ${item.phone || 'Telephone non renseigne'}`;
  if (entity === 'courses') return `${item.description || 'Description non renseignee'} Pre-requis: ${item.prerequisites || 'aucun'}`;
  if (entity === 'ues') return `${item.courses?.length || 0} matiere(s): ${(item.courses || []).map((id) => getEntityName(data, 'courses', id)).join(', ')}`;
  if (entity === 'diplomas') return item.description || 'Description non renseignee';
  if (entity === 'notifications') return item.message || 'Message non renseigne';
  return '';
}

export default App;
