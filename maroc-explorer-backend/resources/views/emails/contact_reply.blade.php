<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
@component('mail::message')
# Reply from My Morocco App

Dear Customer,

Thank you for contacting us. Here is our response:

{{ $message }}

Best regards,  
My Morocco App Team

@component('mail::button style="background-color: #f9e7ab" ', ['url' => config('app.url')])
Visit Our Website
@endcomponent

@endcomponent
</body>
</html>