import './legal.css';

export const PrivacyPolicy = (): JSX.Element => {

    return (
    <div id='pp-container' style={{padding: 20}}>
        <h1 style={{fontSize: 26, marginBottom: 16}}>Privacy Policy</h1>

        <p><strong>1. Information We Collect</strong></p>
        <p className='ml-5'>We collect basic profile information through Google authentication, including your basic public info like email, name, and avatar if provided.</p>
        <p><strong>2. How We Use Your Information</strong></p>
        <p className='ml-5'>a. We use the collected information to personalize user experience, and keep track of the scoring in the games.</p>
        <p className='ml-5'>b. We do not sell, trade, or otherwise transfer your personally identifiable information to third parties.</p>
        <p><strong>3. Cookies</strong></p>
        <p className='ml-5'>We use cookies to  improve user experience. Third party authorization services may use cookies to enable faster log-in.</p>
        <p><strong>4. Security</strong></p>
        <p className='ml-5'>We implement a variety of security measures to maintain the safety of your personal information and we do not store any personal identifiable information on our databases.</p>
        <p><strong>5. Third-Party Links</strong></p>
        <p className='ml-5'>Our website may contain links to third-party websites. We have no control over the content and privacy practices of these sites.</p>
        <p><strong>6. Changes to the Privacy Policy</strong></p>
        <p className='ml-5'>We reserve the right to update our Privacy Policy at any time.</p>
        <p><strong>7. Contact Information</strong></p>
        <p className='ml-5'>For questions about this Privacy Policy, please contact the admin.</p>
    </div>

    )
};