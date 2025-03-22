# Anonymous Feedback System

## Overview

The Anonymous Feedback System is a platform designed to facilitate the collection of anonymous feedback from users. It allows administrators to invite participants via email, verify their identities using a unique code, and collect feedback securely and anonymously. This system ensures that feedback is gathered in a structured and confidential manner, promoting honest and constructive input.

## Features

- **Admin Invitation via CSV**: Administrators can upload a CSV file containing participant details (e.g., email addresses) to invite users for feedback.
- **Email Extraction**: The system automatically extracts email addresses from the uploaded CSV file.
- **Feedback Topics**: Administrators can specify the topic or subject for which feedback is being collected.
- **Random Code Generation**: A unique random code is generated for each participant and sent to their email for verification.
- **User Verification**: Participants verify their identity using their email address and the random code they received.
- **Anonymous Feedback Submission**: Once verified, participants can submit their feedback anonymously.

## Workflow

1. **Admin Invitation**:
    - The administrator uploads a CSV file containing participant email addresses.
    - The system extracts the email addresses and associates them with the feedback topic.
    - A unique random code is generated for each email address.

2. **Email Notification**:
    - Each participant receives an email containing the feedback topic and their unique random code.
    - The email provides instructions on how to verify their identity and submit feedback.

3. **User Verification**:
    - Participants visit the feedback system and enter their email address and the random code they received.
    - The system verifies the email and code combination to ensure authenticity.

4. **Feedback Submission**:
    - Once verified, participants can submit their feedback anonymously.
    - The system ensures that feedback is not linked to the participant's identity, maintaining confidentiality.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/anonymous-feedback-system.git
    cd anonymous-feedback-system
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
      ```
      EMAIL_SERVICE=<your-email-service>
      EMAIL_USER=<your-email-address>
      EMAIL_PASSWORD=<your-email-password>
      DATABASE_URL=<your-database-url>
      ```

4. Run the application:
    ```bash
    npm start
    ```

## Usage

### Admin Panel

1. Log in to the admin panel.
2. Upload a CSV file containing participant email addresses.
3. Specify the feedback topic.
4. Send invitations to participants.

### Participant Workflow

1. Check your email for the invitation and unique random code.
2. Visit the feedback system and enter your email address and random code.
3. Verify your identity.
4. Submit your feedback anonymously.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Database**: MongoDB (or any other database of your choice)
- **Email Service**: Nodemailer (or any other email-sending library)
- **Authentication**: Random code-based verification

## Security Considerations

- **Data Anonymity**: Feedback submissions are stored without linking them to participant identities.
- **Code Expiry**: Random codes have a limited validity period to prevent misuse.
- **Secure Communication**: All communication between the client and server is encrypted using HTTPS.

## Future Enhancements

- Add support for multiple feedback topics per participant.
- Implement a dashboard for administrators to view aggregated feedback.
- Introduce multi-language support for a broader audience.
- Add CAPTCHA to prevent automated submissions.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to your branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please contact [your-email@example.com](mailto:your-email@example.com).