$file = $args[0]
$content = Get-Content $file
$newContent = $content | ForEach-Object {
    if ($_ -match '^pick b9546d5') {
        'edit b9546d5 founder ui updated'
    } else {
        $_
    }
}
Set-Content $file -Value $newContent

