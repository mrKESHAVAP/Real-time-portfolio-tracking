# 📦 Deployment Guide

Complete guide for deploying the Stock Broker Dashboard to production.

## Overview

- **Backend**: Deploy to Render or Railway
- **Frontend**: Deploy to Vercel or Netlify
- **WebSocket**: Ensure WSS (secure WebSocket) is configured

---

## Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `stock-dashboard-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Set Environment Variables**
   In Render dashboard, add:
   ```
   PORT=3001
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
   *(You'll update CORS_ORIGIN after frontend deployment)*

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://stock-dashboard-backend.onrender.com`

### Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account (code already pushed)
- Vercel account (free tier available)

### Steps

1. **Update Socket.IO URL**
   
   Create `frontend/.env.production`:
   ```env
   VITE_SOCKET_URL=https://stock-dashboard-backend.onrender.com
   ```

2. **Update socket.js to use environment variable**
   
   Edit `frontend/src/socket.js`:
   ```javascript
   const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
     autoConnect: true,
     reconnection: true,
     reconnectionDelay: 1000,
     reconnectionAttempts: 5
   });
   ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     ```
     VITE_SOCKET_URL=https://stock-dashboard-backend.onrender.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Note your frontend URL: `https://stock-dashboard.vercel.app`

5. **Update Backend CORS**
   - Go back to Render
   - Update `CORS_ORIGIN` environment variable to your Vercel URL
   - Redeploy backend

### Alternative: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables in Netlify dashboard
6. Deploy

---

## Post-Deployment Configuration

### 1. Update Backend CORS

In your Render/Railway backend environment variables:
```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

### 2. Test WebSocket Connection

- Open your deployed frontend
- Open browser DevTools → Console
- Look for: `✅ Connected to server`
- If you see connection errors, check:
  - Backend is running
  - CORS is configured correctly
  - Both HTTP**S** and WS**S** are working

### 3. SSL/TLS (WebSocket Security)

**Render/Railway**: Automatically provides HTTPS and WSS

**Socket.IO**: Automatically upgrades to WSS when using HTTPS URL

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=3001
CORS_ORIGIN=https://your-frontend-url.com
NODE_ENV=production
```

### Frontend (.env.production)
```env
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## Troubleshooting

### WebSocket Not Connecting

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check backend logs in Render/Railway dashboard
2. Verify CORS_ORIGIN includes your frontend URL
3. Ensure backend is using `process.env.PORT`
4. Test backend health endpoint: `https://your-backend.com/health`

### CORS Errors

**Problem**: CORS policy blocking requests

**Solutions**:
1. Add your frontend URL to CORS_ORIGIN
2. Include protocol (https://) in CORS_ORIGIN
3. Multiple origins: separate with commas
4. Redeploy backend after changing env vars

### Build Failures

**Frontend Build Fails**:
- Check `frontend/package.json` has all dependencies
- Verify `vite.config.js` is correct
- Check build logs for specific errors

**Backend Build Fails**:
- Verify `backend/package.json` has `"type": "module"`
- Check all imports use `.js` extensions
- Review server logs

### Performance Issues

**Free Tier Limitations**:
- Render free tier: spins down after 15 min of inactivity
- First request after sleep: 30-60 sec delay
- Consider upgrading for production use

**Optimization**:
- Reduce price update frequency in production (every 2-3 sec instead of 1 sec)
- Implement connection pooling
- Use Redis for state if scaling beyond free tier

---

## Monitoring & Maintenance

### Health Checks

Backend health endpoint:
```
GET https://your-backend.com/health

Response:
{
  "status": "ok",
  "connectedUsers": 5,
  "basicUsers": 3,
  "premiumUsers": 2
}
```

### Logs

**Render**: Dashboard → Your Service → Logs tab

**Vercel**: Dashboard → Your Project → Deployments → View Function Logs

### Updates

1. Push code changes to GitHub
2. Vercel/Render auto-deploys on push to main branch
3. Or manually trigger deployment from dashboard

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] WebSocket connection working (check browser console)
- [ ] CORS configured with frontend URL
- [ ] Environment variables set correctly
- [ ] SSL/TLS working (HTTPS + WSS)
- [ ] Test all features:
  - [ ] Login with basic/premium users
  - [ ] Stock subscriptions working
  - [ ] Real-time price updates
  - [ ] Buy/sell transactions
  - [ ] Portfolio calculations
  - [ ] Activity log updates
  - [ ] Theme toggle persists
- [ ] Multi-device testing (desktop, mobile, tablet)
- [ ] Performance acceptable (< 2sec initial load)

---

## Cost Estimates

### Free Tier (Sufficient for Portfolio/Demo)

- **Render Backend**: Free (with sleep after 15 min)
- **Vercel Frontend**: Free (100GB bandwidth/month)
- **Total**: $0/month

### Paid Tier (For Production)

- **Render Starter**: $7/month (always-on, 512MB RAM)
- **Vercel Pro**: $20/month (unlimited bandwidth, better performance)
- **Total**: $27/month

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### Render (Backend)
1. Go to Settings → Custom Domain
2. Add domain (e.g., api.yourdomain.com)
3. Update DNS CNAME record
4. SSL certificate auto-provisioned

### Update CORS
```
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

---

## Security Considerations

### Current Implementation (Demo)
- ⚠️ No real authentication (email-only login)
- ⚠️ No data persistence (in-memory storage)
- ⚠️ Public WebSocket endpoint

### For Production Enhancement
- ✅ Add JWT authentication
- ✅ Use PostgreSQL/MongoDB for data
- ✅ Add rate limiting
- ✅ Implement proper user sessions
- ✅ Add input validation/sanitization
- ✅ Use environment secrets management

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **Vite Docs**: https://vitejs.dev/guide/

---

**Your Stock Broker Dashboard is now production-ready! 🚀**
