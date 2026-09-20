# Contributing

Thanks for considering a contribution.

## What belongs here

- Fixes to scout markers, drawer, or thread panel
- Better place-name resolution
- Multi-user sync (Supabase or another free backend)
- Documentation and onboarding

## What does not

- Anything that turns Scouts into a separate app. It stays a layer on God's Eye.
- Personal-data tracking or surveillance features
- Changes to God's Eye itself (propose those upstream)

## How

1. Fork this repo
2. `git checkout -b your-feature-name`
3. Make your change
4. Test locally with `npm run dev` - verify markers, drawer, and posting still work
5. Push and open a Pull Request

## Code style

Plain ES modules. No build step. No framework. Small readable files.

Imports first, then code. This is not optional - imports after code will break the module silently.