const bcrypt = require('bcrypt');
const { User } = require('./models');

const createAdmin = async () => {
  const email = '167055@mail.tbb.com.tw';
  const password = 'Abcd1234';

  const exists = await User.findOne({ where: { email } });
  if (exists) return;

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed, isAdmin: true });
  console.log('✅ 初始管理員帳號已建立');
};

module.exports = createAdmin;
