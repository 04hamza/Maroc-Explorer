<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Submission - Maroc Explorer</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #f9e7ab; border-radius: 8px 8px 0 0; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Submission</h1>
                            <p style="color: #d9e6e6; margin: 5px 0 0; font-size: 14px;">Maroc Explorer</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                                Dear Team,<br>
                                A new contact form submission has been received. Below are the details:
                            </p>
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="display: inline-block; width: 120px; font-size: 14px; color: #555555;">Name:</strong>
                                        <span style="font-size: 14px; color: #333333;">{{ $name }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="display: inline-block; width: 120px; font-size: 14px; color: #555555;">Subject:</strong>
                                        <span style="font-size: 14px; color: #333333;">{{ $subject }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="display: inline-block; width: 120px; font-size: 14px; color: #555555;">Message:</strong>
                                        <span style="font-size: 14px; color: #333333;">{{ $form_message }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="display: inline-block; width: 120px; font-size: 14px; color: #555555;">Consent:</strong>
                                        <span style="font-size: 14px; color: #333333;">{{ $consent ? 'Yes' : 'No' }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <strong style="display: inline-block; width: 120px; font-size: 14px; color: #555555;">Submitted:</strong>
                                        <span style="font-size: 14px; color: #333333;">{{ $contact->created_at }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; border-radius: 0 0 8px 8px; padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #666666;">
                                This email was sent from the Maroc Explorer contact form.<br>
                                Please review and respond to the submission as needed.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: #666666;">
                                &copy; {{ date('Y') }} Maroc Explorer. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>