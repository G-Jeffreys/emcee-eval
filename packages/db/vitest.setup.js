import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
// Use an in-memory database for tests
process.env.DATABASE_URL = `file:memdb-${randomUUID()}?mode=memory&cache=shared`;
beforeAll(async () => {
    // Apply migrations to the test database
    try {
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
    }
    catch (error) {
        // If migrations fail, try to push the schema directly
        execSync('npx prisma db push', {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
    }
});
