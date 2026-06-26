import 'dotenv/config';
import mongoose from 'mongoose';
import Paper from '../models/paper.js';
import Note from '../models/Note.js';
import User from '../models/user.js';

const withDatabaseName = (uri, dbName) => {
  if (!dbName) return uri;

  const [base, query = ''] = uri.split('?');
  const slashIndex = base.indexOf('/', 'mongodb://'.length);
  const nextBase = slashIndex === -1
    ? `${base}/${dbName}`
    : `${base.slice(0, slashIndex)}/${dbName}`;

  return query ? `${nextBase}?${query}` : nextBase;
};

const main = async () => {
  const dbName = process.argv[2];
  const mongoUri = withDatabaseName(process.env.MONGODB_URI, dbName);

  await mongoose.connect(mongoUri, { family: 4 });

  const admin = mongoose.connection.db.admin();
  const databases = await admin.listDatabases();

  const result = {
    currentDb: mongoose.connection.name,
    databases: databases.databases.map((db) => db.name),
    papersTotal: await Paper.countDocuments(),
    approvedPublicPapers: await Paper.countDocuments({ status: 'approved', visibility: 'public' }),
    pendingPapers: await Paper.countDocuments({ status: 'pending' }),
    notesTotal: await Note.countDocuments(),
    approvedPublicNotes: await Note.countDocuments({ status: 'approved', visibility: 'public' }),
    pendingNotes: await Note.countDocuments({ status: 'pending' }),
    usersTotal: await User.countDocuments(),
  };

  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors during diagnostics
  }
  process.exit(1);
});