<?php
/**
 * CaféNest – PHP Built-in Server Router
 *
 * Start with:
 *   C:\php\php.exe -S localhost:8000 router.php
 *
 * This router:
 *   1. Serves static files (HTML, CSS, JS, images) directly.
 *   2. Forwards /backend/api/*.php requests to the backend.
 *   3. Serves index.php for the root URL.
 *   4. Sends proper MIME types.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// ── Map extension → MIME type ────────────────────────────────────────────
$mimeMap = [
    'html' => 'text/html; charset=UTF-8',
    'htm'  => 'text/html; charset=UTF-8',
    'css'  => 'text/css; charset=UTF-8',
    'js'   => 'application/javascript; charset=UTF-8',
    'json' => 'application/json',
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif'  => 'image/gif',
    'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2'=> 'font/woff2',
    'ttf'  => 'font/ttf',
    'mp4'  => 'video/mp4',
    'webp' => 'image/webp',
];

$docRoot = __DIR__;

// ── Root → index.php ────────────────────────────────────────────────────
if ($uri === '/' || $uri === '/index.php') {
    require $docRoot . '/index.php';
    exit;
}

// ── PHP backend API files — let PHP handle them directly ─────────────────
if (strpos($uri, '/backend/api/') === 0 && substr($uri, -4) === '.php') {
    $file = $docRoot . $uri;
    if (is_file($file)) {
        require $file;
        exit;
    }
}

// ── Static file serving ───────────────────────────────────────────────────
$file = $docRoot . $uri;

if (is_file($file)) {
    $ext  = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = $mimeMap[$ext] ?? 'application/octet-stream';
    header('Content-Type: ' . $mime);
    readfile($file);
    exit;
}

// ── Directory → look for index.html ──────────────────────────────────────
if (is_dir($file)) {
    $index = rtrim($file, '/') . '/index.html';
    if (is_file($index)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($index);
        exit;
    }
}

// ── 404 ───────────────────────────────────────────────────────────────────
http_response_code(404);
header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html><html><head><title>404 Not Found</title>
<style>body{font-family:system-ui;background:#FAF6EE;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;padding:40px;background:#fff;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.1);}
h1{color:#5A2E14;margin:0 0 8px;}p{color:#6B5A4C;}a{color:#5A2E14;font-weight:600;}</style></head>
<body><div class="box"><h1>404</h1><p>Page not found: <code>' . htmlspecialchars($uri) . '</code></p>
<a href="/">← Back to CaféNest</a></div></body></html>';
exit;
