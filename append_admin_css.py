import os
css_path = r"c:\Users\HP\Desktop\DBMS_Project\frontend\static\css\styles.css"
admin_css = """

/* ===== ADMIN PANEL STYLES ===== */
.admin-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
.admin-sidebar{background:var(--bg-card);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.admin-sidebar-header{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.sidebar-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:800;color:var(--text)}
.sidebar-logo span{color:var(--primary)}
.admin-sidebar-nav{flex:1;padding:.75rem .75rem;display:flex;flex-direction:column;gap:.1rem}
.sidebar-section-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-faint);padding:.6rem .75rem .3rem}
.sidebar-nav-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;border-radius:var(--radius);border:none;background:none;color:var(--text-muted);font-size:.875rem;font-weight:500;cursor:pointer;text-decoration:none;transition:background .15s,color .15s;width:100%;text-align:left}
.sidebar-nav-item:hover,.sidebar-nav-item.active{background:rgba(212,163,115,.1);color:var(--primary)}
.sidebar-nav-item.active{font-weight:700}
.sidebar-footer{padding:.75rem;border-top:1px solid var(--border)}
.nav-icon{font-size:1rem;width:1.25rem;text-align:center}
.admin-main{min-height:100vh;display:flex;flex-direction:column;overflow-x:hidden}
.admin-topbar{background:var(--bg-card);border-bottom:1px solid var(--border);padding:.875rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.admin-page-title{font-weight:700;font-size:1.1rem}
.admin-content{flex:1;padding:1.5rem}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;display:flex;align-items:center;gap:1rem;transition:transform .2s}
.stat-card:hover{transform:translateY(-2px)}
.stat-icon{width:48px;height:48px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0}
.stat-icon-primary{background:rgba(212,163,115,.15);color:var(--primary)}
.stat-icon-success{background:rgba(34,197,94,.15);color:#22c55e}
.stat-icon-info{background:rgba(59,130,246,.15);color:#3b82f6}
.stat-icon-warning{background:rgba(234,179,8,.15);color:#eab308}
.stat-label{font-size:.75rem;color:var(--text-muted);margin-bottom:.25rem}
.stat-value{font-size:1.5rem;font-weight:800;color:var(--text);line-height:1}
.table-wrap{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow-x:auto}
.table-wrap table{width:100%;border-collapse:collapse;font-size:.875rem}
.table-wrap th{background:var(--bg-raised);padding:.75rem 1rem;text-align:left;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:1px solid var(--border);white-space:nowrap}
.table-wrap td{padding:.75rem 1rem;border-bottom:1px solid var(--border);vertical-align:middle}
.table-wrap tr:last-child td{border-bottom:none}
.table-wrap tr:hover td{background:rgba(255,255,255,.02)}
.card-raised{background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius)}
.p-2{padding:.75rem}
@media(max-width:900px){
  .admin-layout{grid-template-columns:1fr}
  .admin-sidebar{position:fixed;left:-260px;width:240px;height:100vh;z-index:200;transition:left .25s;top:0}
  .admin-sidebar.open{left:0;box-shadow:4px 0 20px rgba(0,0,0,.5)}
  .sidebar-toggle-btn{display:flex!important}
}
"""
with open(css_path, 'a', encoding='utf-8') as f:
    f.write(admin_css)
print(f"Admin CSS appended. Total size: {os.path.getsize(css_path)} bytes")
