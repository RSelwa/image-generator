# Daily Challenge

A daily quiz where players guess a game from a single image (spherical or flat). One challenge per day, visible per week, with results tracked per user.

## Data model

### `dailyChallenges/{date}` (date = `YYYY-MM-DD`)

| Field | Type | Description |
|---|---|---|
| `date` | `string` | Document ID, `YYYY-MM-DD` format |
| `gameId` | `string` | Associated game |
| `gameTitle` | `string` | Game name |
| `gameAlternateNames` | `string[]` | Accepted alternate answers |
| `isSpherical` | `boolean` | `true` = 360° image, `false` = flat image |
| `difficulty` | `easy \| medium \| hard` | Challenge difficulty |
| `sphericalId?` | `string` | Spherical image doc ID (if isSpherical) |
| `sphericalImageUrl?` | `string` | Spherical image URL |
| `flatId?` | `string` | Flat image doc ID (if !isSpherical) |
| `flatImageUrl?` | `string` | Flat image URL |
| `mapId?` | `string` | Map reference (optional location guessing) |
| `mapImage?` | `string` | Map image URL |
| `mapWidth?` | `number` | Map dimensions |
| `mapHeight?` | `number` | Map dimensions |
| `maxDistancePoints?` | `number` | Max points from distance (0–100%) |
| `createdBy` | `string` | Admin UID |
| `createdAt` | `Timestamp` | Creation time |

### `users/{uid}/dailyChallengeResults/{date}`

| Field | Type | Description |
|---|---|---|
| `date` | `string` | `YYYY-MM-DD` |
| `answer` | `string` | Player's submitted answer |
| `isCorrect` | `boolean` | Whether the answer matched |
| `position?` | `{ x: number, y: number }` | Player's map pin (if map challenge) |
| `completedAt` | `Timestamp` | Submission time |

## Player flow

1. `/daily-challenge` — Weekly calendar view (Mon–Sun)
   - Past and today's challenges are playable
   - Future dates are locked
   - Already completed challenges show ✓ / ✗ badge
2. `/daily-challenge/[date]` — Single challenge page
   - Shows the image (spherical or flat)
   - Player submits a game name as answer
   - Optional: place a pin on the map
   - Result is saved to their `dailyChallengeResults` subcollection
   - Answer and correct/incorrect feedback shown after submission

## Admin flow

`/admin/daily-challenge`

- Table of all challenges ordered by date descending, paginated (20/page, infinite scroll)
- Searchable by date or game title
- Click a row to open the edit sheet

### Edit sheet

Fields filled via cascading selects:

1. **Game select** — lists all games by title, auto-fills `gameId`, `gameTitle`, `gameAlternateNames`
2. **Spherical toggle** — switches the image type
3. **Image select** — lists `READY` sphericals or flats for the selected game, auto-fills the ID and image URL
4. **Map fields** — manual inputs for `mapId`, `mapImage`, `mapWidth`, `mapHeight`
5. **Max distance points** — scoring weight for map guessing

### Mutations

| Action | Description |
|---|---|
| Create | `POST` to `dailyChallenges/{date}` with full input |
| Update | Partial update on existing document |
| Delete | Hard delete, removes the document |

## Redux API

Endpoints defined in `apps/front/redux/api/daily-challenge.ts`:

| Hook | Type | Purpose |
|---|---|---|
| `useGetDailyChallengeByDateQuery` | Query | Single challenge by date |
| `useGetDailyChallengesInfiniteQuery` | Infinite query | Admin paginated list |
| `useGetDailyChallengesByWeekQuery` | Query | 7-day player view |
| `useGetDailyChallengesByMonthQuery` | Query | Calendar month view |
| `useGetMyDailyChallengeResultsQuery` | Query | All results for a user |
| `useGetMyDailyChallengeResultByDateQuery` | Query | Single result for user + date |
| `useCreateDailyChallengeMutation` | Mutation | Admin create |
| `useUpdateDailyChallengeMutation` | Mutation | Admin update |
| `useDeleteDailyChallengeMutation` | Mutation | Admin delete |
| `useSubmitDailyChallengeResultMutation` | Mutation | Player submit answer |

## Pending

- [ ] Date picker in admin form (currently a text input)
- [ ] Share daily challenge
- [ ] Streak / success tracking
- [ ] Path/progression view for challenges
