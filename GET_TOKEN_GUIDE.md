# How to Get Your Supabase Access Token

## Option 1: Get Token from Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a name (e.g., "CLI Access")
4. Copy the token (starts with `sbp_`)
5. **Send it to me so I can deploy from the Linux environment**

## Option 2: Get Token via CLI

If you have any version of Supabase CLI working:

```powershell
# This will open browser and give you a token
supabase login
```

The token will be displayed in your terminal.

## Option 3: Already Have It?

If you've logged in before, your token might be stored at:
- Windows: `%APPDATA%\supabase\access-token`
- Linux/Mac: `~/.supabase/access-token`

## What I'll Do With Your Token

Once you provide the token, I'll:
1. Set it as an environment variable
2. Link the project
3. Deploy both functions (stripe-webhook and create-checkout-session)
4. Verify deployment
5. Show you the function URLs

## Security Note

- This token grants access to your Supabase projects
- Only share it in a secure environment
- You can revoke it anytime from the Supabase dashboard
- I'll only use it for deployment and won't store it

## Next: Send Me Your Token

Reply with:
```
My token is: sbp_xxxxxxxxxxxxx
```

Or if you prefer to deploy yourself on Windows, follow the **WINDOWS_SUPABASE_FIX.md** guide!
