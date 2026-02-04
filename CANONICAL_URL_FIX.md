# Google Canonical URL Fix - Additional Steps

## Current Issues (Jan 14, 2026 - 8:09 AM)

### Issue 1: Wrong Canonical Selected
Google crawled your site but selected the **wrong canonical**:
- ❌ **Google-selected canonical**: `https://www.mellowsites.com/` (with www)
- ✅ **Correct canonical**: `https://mellowsites.com/` (without www)
- **Status**: "Duplicate without user-selected canonical"

### Issue 2: Sitemap Not Fetchable
- ❌ **Status**: "Couldn't fetch"
- **URL**: https://mellowsites.com/sitemap.xml
- **Cause**: Missing proper headers and redirect rules for XML file

## Why This Happened

1. Google crawled via HTTP referring page: `http://mellowsites.com/`
2. Even though redirects are in place, Google hasn't re-crawled from the proper canonical URL
3. The www variant might have been indexed first before our redirects

## Fixes Applied (Round 2)

### 1. Enhanced Home Page SEO
- ✅ Added `ProfilePage` structured data to [src/pages/Home.jsx](src/pages/Home.jsx)
- ✅ Added `BreadcrumbList` schema for better navigation
- ✅ Enhanced Open Graph tags with image dimensions
- ✅ Added more comprehensive robots meta tags

### 2. Strengthened Robots.txt
- ✅ Updated [public/robots.txt](public/robots.txt) with explicit canonical preference
- ✅ Added comments about canonical domain

### 3. Removed Conflicting Headers
- ✅ Removed generic Link canonical header from [netlify.toml](netlify.toml)
- ✅ Let page-specific canonical tags take precedence

### 4. Fixed Sitemap Accessibility (NEW)
- ✅ Added proper XML headers to [netlify.toml](netlify.toml) for sitemap.xml
- ✅ Added explicit redirect rules in [public/_redirects](public/_redirects)
- ✅ Ensured sitemap bypasses SPA fallback routing
- ✅ Set proper Content-Type: `application/xml`

## Critical Next Steps (DO THESE NOW)

### Step 1: Deploy These Changes
```bash
git add .
git commit -m "Fix Google canonical URL selection - enforce https://mellowsites.com"
git push
```

### Step 2: Verify Deployment (Wait 5-10 minutes)
After deployment, verify:

1. **Check redirects work:**
   ```bash
   curl -I http://mellowsites.com/
   curl -I http://www.mellowsites.com/
   curl -I https://www.mellowsites.com/
   ```
   All should return `301` and redirect to `https://mellowsites.com/`

2. **Check canonical tags:**
   - Visit: https://mellowsites.com/
   - View source (Ctrl+U)
   - Search for `<link rel="canonical"` - should be `https://mellowsites.com/`
   - Search for `application/ld+json` - verify structured data is present

### Step 3: Google Search Console - Force Re-Indexing

**This is CRITICAL - You must tell Google to re-crawl with the correct URL:**

1. **Go to Google Search Console**: https://search.google.com/search-console

2. **Use URL Inspection Tool for the CORRECT canonical URL:**
   - Enter: `https://mellowsites.com/` (without www!)
   - Click "Request Indexing"
   
3. **Remove the wrong canonical from Google:**
   - Go to "Removals" in the left menu
   - Click "New Request"
   - Enter: `https://www.mellowsites.com/`
   - Select "Remove this URL only"
   - Submit request

4. **Mark the redirect issues as fixed:**
   - Go to "Page indexing" report
   - Find "Page with redirect" section
   - Click "Validate fix"

5. **Submit sitemap again:**
   - Go to "Sitemaps"
   - Remove old sitemap if present
   - Add: `https://mellowsites.com/sitemap.xml`
   - Submit

6. **Request indexing for all pages:**
   Use URL Inspection for each:
   - `https://mellowsites.com/`
   - `https://mellowsites.com/about`
   - `https://mellowsites.com/contact`
   - `https://mellowsites.com/projects`
   - `https://mellowsites.com/resume`
   
   For each, click "Test Live URL" then "Request Indexing"

### Step 4: Add Canonical Domain in Netlify Settings

1. Go to Netlify Dashboard
2. Select your site
3. Go to "Domain management"
4. Find "HTTPS" section
5. Make sure primary domain is set to: `mellowsites.com` (without www)

### Step 5: Google Search Central - Change of Address (If Needed)

If you previously had `www.mellowsites.com` as primary:

1. Go to Search Console
2. Click Settings (gear icon)
3. Click "Change of address"
4. Indicate move from `www.mellowsites.com` to `mellowsites.com`

## Verification Checklist

After completing all steps above, verify:

- [ ] Deployed latest changes to Netlify
- [ ] All redirects work correctly (test with curl)
- [ ] Canonical tags visible in page source
- [ ] Structured data present in all pages
- [ ] Requested indexing for canonical URLs in Search Console
- [ ] Requested removal of www variant
- [ ] Validated redirect fixes in Search Console
- [ ] Submitted sitemap
- [ ] Primary domain set in Netlify
- [ ] Waited 24-48 hours for Google to re-crawl

## Testing Commands

**Test sitemap accessibility:**
```bash
# Should return 200 OK with XML content
curl -I https://mellowsites.com/sitemap.xml

# View sitemap content
curl https://mellowsites.com/sitemap.xml
```

**Test redirects:**
```bash
# Should return 301 redirect to https://mellowsites.com/
curl -I http://mellowsites.com/
curl -I http://www.mellowsites.com/
curl -I https://www.mellowsites.com/

# Should return 200 OK
curl -I https://mellowsites.com/
```

**Test canonical in HTML:**
```bash
curl -s https://mellowsites.com/ | grep -i canonical
```

**Test structured data:**
```bash
curl -s https://mellowsites.com/ | grep -i "application/ld+json"
```

## Expected Timeline After These Fixes

- **Immediate**: Redirects work
- **1-3 days**: Google re-crawls with correct canonical
- **3-7 days**: Wrong canonical removed from index
- **7-14 days**: All pages indexed under correct canonical
- **14-30 days**: Full indexing and ranking stabilization

## Important Notes

1. **Don't panic** - This is a common issue and fixable
2. **Be patient** - Google can take 7-14 days to fully process canonical changes
3. **Monitor weekly** - Check Search Console every week
4. **Don't change URLs** - Keep canonical consistent from now on

## Additional Resources

- [Google: Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: Specify a canonical](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Netlify: Canonical URL setup](https://docs.netlify.com/routing/redirects/)

---

**Created**: January 14, 2026
**Issue**: Google selecting wrong canonical (www instead of non-www)
**Status**: Fixes deployed, awaiting Google re-crawl
