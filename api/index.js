export default function handler(req, res) {
  res.status(200).json({
    name: 'Startup CRM Lite API Router',
    status: 'active',
    backendUrl: 'https://startup-crm-backend-1k2o.onrender.com'
  });
}
