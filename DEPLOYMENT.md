# Deployment Checklist for Vercel

## Pre-deployment Checklist

### Environment Variables
- [ ] Set up `DB_URI` in Vercel environment variables
- [ ] Set up `JWT_SECRET` in Vercel environment variables  
- [ ] Set up `NODE_ENV=production` in Vercel environment variables

### Database Setup
- [ ] MongoDB database is accessible from Vercel
- [ ] Database connection string is correct
- [ ] Database has proper indexes for performance

### Code Verification
- [ ] Frontend builds successfully (`npm run build` in frontend/)
- [ ] Backend API routes are working
- [ ] All imports use correct file extensions (.jsx)
- [ ] No console.log statements in production code

### Vercel Configuration
- [ ] `vercel.json` is properly configured
- [ ] Frontend build output directory is correct (`frontend/dist`)
- [ ] API routes are properly mapped
- [ ] Static file routes are configured

## Deployment Steps

1. **Connect Repository to Vercel**
   - Import project from GitHub/GitLab/Bitbucket
   - Select the correct repository

2. **Configure Environment Variables**
   ```
   DB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically detect the configuration
   - Frontend will be built and deployed as static files
   - Backend will be deployed as serverless functions

4. **Test Deployment**
   - [ ] Homepage loads correctly
   - [ ] Authentication works
   - [ ] API endpoints respond correctly
   - [ ] Database operations work
   - [ ] All routes work properly

## Post-deployment Verification

### Frontend Tests
- [ ] Login/Register functionality
- [ ] Dashboard loads with correct data
- [ ] Book browsing works
- [ ] Book publishing works
- [ ] Profile page displays correctly
- [ ] Navigation works on all routes

### Backend Tests
- [ ] `/api/` routes are accessible
- [ ] `/user/` routes work correctly
- [ ] `/book/` routes work correctly
- [ ] Authentication middleware works
- [ ] Database operations complete successfully

### Performance Tests
- [ ] Pages load quickly
- [ ] API responses are fast
- [ ] No JavaScript errors in console
- [ ] Mobile responsiveness works

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check all imports have correct file extensions
   - Ensure all dependencies are installed
   - Verify there are no syntax errors

2. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check database connection string
   - Ensure JWT_SECRET is set

3. **Routing Issues**
   - Verify vercel.json route configuration
   - Check that frontend routes don't conflict with API routes
   - Ensure SPA routing works correctly

4. **Authentication Issues**
   - Check JWT_SECRET is consistent
   - Verify token storage and retrieval
   - Check middleware configuration

## Success Criteria

The deployment is successful when:
- [ ] Users can register and login
- [ ] Users can browse and search books
- [ ] Users can publish books
- [ ] Users can borrow and return books
- [ ] User profile shows correct information
- [ ] All navigation works correctly
- [ ] No errors in browser console
- [ ] Mobile and desktop views work properly

## Next Steps After Deployment

1. **Setup Custom Domain** (Optional)
   - Configure custom domain in Vercel
   - Update any hardcoded URLs

2. **Monitoring**
   - Set up error tracking
   - Monitor API performance
   - Set up uptime monitoring

3. **Security**
   - Review and rotate JWT secrets regularly
   - Monitor for security vulnerabilities
   - Keep dependencies updated

4. **Performance**
   - Optimize images and assets
   - Enable CDN for static assets
   - Monitor page load times
