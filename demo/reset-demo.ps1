# Restaura el entorno de demo a su estado inicial (RNF3: < 60 s).
# Uso (desde la raíz del repo):  powershell -ExecutionPolicy Bypass -File demo\reset-demo.ps1
# Pendiente H3 (I7): cargar el seed y reiniciar el reloj vía POST /api/demo/reinicios.

$ErrorActionPreference = 'Stop'
$inicio = Get-Date
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location $raiz
try {
    Write-Host 'Borrando la base de datos de demo...'
    docker compose down -v
    Write-Host 'Levantando PostgreSQL...'
    docker compose up -d --wait
    Write-Host 'Listo. Ahora arrancar el backend con el perfil demo (Flyway recrea el esquema).'
}
finally {
    Pop-Location
}
$segundos = [int]((Get-Date) - $inicio).TotalSeconds
Write-Host "Reset completado en $segundos s"
