# FinFlow

## Description

Manage your personal finances.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies

- Next.js v14
- TypeScript
- Supabase
- Tailwind CSS & Tailwind UI
- zod
- Jest

## Jest testing

Run the tests:

```bash
npm run test
```

Note the configuration file at the root of the project: `jest.config.js`.

# Notes

## Calculating available balance

Stored Value Approach (Simpler)

How it works: Keep a precomputed available_amount column in the monthly_budget table (or equivalent). Update it whenever a relevant action occurs (e.g., adding a transaction, editing a budget category).

Benefits:

Drastically reduces the number of database calls on load.
Faster page loads and interactions for the user.
Easier debugging since you're updating a single value instead of juggling multiple calculated pieces in real-time.

Challenges:

Potential desync issues if something doesn't trigger an update correctly (but these can be caught with periodic checks).

Real-Time Calculation (More Accurate)

How it works: Use your calculateAvailableAmount function as you are now, ensuring that every calculation is fresh and pulls from up-to-date data.

Benefits:

Guaranteed accuracy with no risk of stale values.
Handles edge cases better (e.g., when the user makes manual changes to older months).

Challenges:

Heavy on database queries, especially as the number of transactions and budgets grows.
Slower user experience for every page load and interaction.

### Hybrid Approach (Best of Both Worlds)

If you're willing to get a bit fancy, you could combine both methods:

Store the available_amount in the database and update it whenever:

- A transaction is added, edited, or deleted.
- A category goal is changed.
- Money is moved between categories or months.

Run a background "audit" job to validate the stored value periodically (e.g., nightly or when the user logs in) using your calculateAvailableAmount logic. If there's a mismatch, fix it automatically.

Allow manual overrides: If a user wants to adjust historical months, make it a rare action that triggers the recalculation logic for affected months only, not every time.

Your Current calculateAvailableAmount Function
It’s already solid, but I agree—it’s a lot of moving parts for something you’re calling frequently. Moving to a stored value approach would let you use this function sparingly, like:

When initializing a new budget.
When running validations.
For a "Recalculate Available Cash" button, just in case.
TL;DR

**Stored value**: Easier, faster, less taxing on the server. Recommended unless you absolutely need real-time calculations.
Real-time: Stick with it if accuracy and flexibility are your top priorities, but expect some performance hits.

**Hybrid**: Best if you’re looking for balance—store the value but periodically validate with your existing function.

Your stored-value idea is solid, especially since you’re already leaning toward prioritizing user experience and minimizing server calls. Let’s keep FinFlow smooth and responsive—your future users will thank you.
