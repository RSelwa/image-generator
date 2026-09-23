## Features TCG + Success

Start from develop, create branches for each steps here, let the reviewer do only 2 turn to not loose too many tokens, create PR from branch to `develop` wait for all test to be green in CI before merging. Clear context after each task completed

Goal: we will add a success system to allow users to win virtual money, that they could exchange to open pack like a TCG. The goal of the success is to ensure that users share the app to their friends and enforce new players.
We will also allow them to buy cosmetics with these

Add feature like Wiki master (wiki-master.com): add a system of internal money (let's call it `credits` for now), we will create a bunch of success to allow users to have more of it. We will create also a TCG system from games/maps in it, with rarity system. We will allow users to exchange it later on.

 - [ ] Clean codebase
   - [ ] Change eslint for oxlint + oxformat + clean (all current codebase), don't review files that will be formated (you will lose tokens for nothing)
   - [ ] Take the config of CI, CLI from flim-monorepo (we've made refacto to clean this system to not have bunch of CI files)

 - [ ] Front Feature flags
   - [ ] Integrate dev tools from `flim-monorepo` -> `apps/web`, pick the FEATURE_FLAGS system, the url, localstorage, the hotkeys system 
   - [ ] Add the Feature Flags: `Money`, `Success`

 - [ ] Users schemas
   - [ ] Add in user's schemas optional fields `credits` (default to 0 if not existing) and `referral code`
   - [ ] Add rules to not let users modify any of these two fields + tests
   - [ ] modify the create user CF to add these fields when user is creating (for the referral code, let's create a utils that generate a unique 6 digit number, regenerate until no users have it yet)
   - [ ] Create a script that populate these fields for existing users (do not run it yet, since it won't be in prod)

 - [ ] Create success data
   - [ ] let's think about the architecture of success: it should ba a collection, where all users will have a sub collection called `achieved_success`, where the id of the doc will be the if of the success, will field `achievedAt`: FirestoreTimestamp, create schemas and constant concerning these. 
   - [ ] Add rules to let anyone reads success, (only admin can write them), and only users can modify in their own sub collection
   - [ ] Populate schemas for success: `reward`: number, `name`: string, `description`: string, `difficulty`?: string; `goalToAchieve`?: number (some success could be "finish 10 games"), `key`: string (ex:change_username)
   - [ ] Create one basic success: modify your userName
 
 - [ ] Front Success:
   - [ ] in admin side, create the crud for the success: a global admin page to see them all, a redux endpoint, + form modification to modify them easily
   - [ ] In client side, we would like to have a success tab in the menu, that will redirect to a success page, a server side page that will fetch raw success, a client component that will fetch your completed ones 
   - [ ] Create component SuccessCard to display the success in these pages. We will figure how to deal with loading system: imo a global load is better than individual one
   - [ ] Create an endpoint to receive all success events in the Next API, add some tests to cover it. we will populate this endpoint depending of future success
   - [ ] implement strong typed schemas for payload: it could have a `key` in the payload and depending on it, some other object in payload would be required (ex: "change_username" should have a "before" and "after" data (from vanilla firestore) )
   - [ ] Let's plug the event of changing the username to fetch this endpoint if the key wasn't achieved yet, the endpoint will verify with the before and after firestore event, if the username has changed, we add the success in the user sub collection, with `achievedAt`, and we add the reward to the user wallet
