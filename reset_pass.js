const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function run() {
    const usersFile = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

    const email = 'admin@demo.com';
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
        users[userIndex].password = hashedPassword;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        console.log('Password updated successfully');
    } else {
        console.log('User not found');
    }
}

run();
