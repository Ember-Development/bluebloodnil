# Database Seed File

This seed file creates test athletes for testing the onboarding flow.

## Test Users Created

### Athletes (for onboarding testing):

1. **Athlete 1** - `athlete1@test.com`
   - User ID: (printed after running seed)
   - Profile: Incomplete (needs full onboarding)
   - Has parent contact info

2. **Athlete 2** - `athlete2@test.com`
   - Profile: Incomplete (needs full onboarding)
   - Basic info only

3. **Athlete 3** - `athlete3@test.com`
   - Profile: Partially complete
   - Has some onboarding data (sport, location, one social profile)
   - Still needs to complete onboarding

4. **Athlete 4** - `athlete4@test.com`
   - Profile: Complete
   - Fully filled out profile
   - Used for testing already-completed profiles

### Admin User:
- **Admin** - `admin@test.com`
  - For testing admin functionality

## Usage

1. **Install dependencies** (if tsx is not installed):
   ```bash
   cd backend
   npm install
   ```

2. **Run the seed**:
   ```bash
   npm run seed
   ```

   Or with Prisma directly:
   ```bash
   npx prisma db seed
   ```

3. **After seeding**, use the printed User IDs in your browser console:
   ```javascript
   localStorage.setItem('userId', '<user-id-from-seed-output>');
   ```

4. **Refresh the page** and navigate to a protected route to trigger onboarding.

## Testing Onboarding Flow

1. Set userId for an incomplete athlete:
   ```javascript
   localStorage.setItem('userId', '<athlete1-user-id>');
   ```

2. Navigate to `/feed` or any protected route
3. Should redirect to `/onboarding`
4. Complete the onboarding steps

## Reset Database

To reset and reseed:
```bash
npx prisma migrate reset
# This will drop the database, recreate it, run migrations, and run seed
```

