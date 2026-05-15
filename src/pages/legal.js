export async function renderLegal(type = 'privacy') {
  const isPrivacy = type === 'privacy'

  const content = isPrivacy ? `
    <h2>Information We Collect</h2>
    <p>We collect information you provide directly to us when you contact us through our website, including your name, email address, and any messages you send.</p>

    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to respond to your inquiries, provide our photography and film services, and communicate with you about projects.</p>

    <h2>Information Sharing</h2>
    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.</p>

    <h2>Cookies</h2>
    <p>Our website does not use tracking cookies. We may use essential cookies to ensure basic functionality of the website.</p>

    <h2>Data Retention</h2>
    <p>We retain your personal information only for as long as necessary to fulfil the purposes outlined in this policy or as required by law.</p>

    <h2>Your Rights</h2>
    <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us directly.</p>

    <h2>Contact</h2>
    <p>For any privacy-related questions, please reach out via the contact page.</p>
  ` : `
    <h2>Use of This Website</h2>
    <p>By accessing this website, you agree to these terms of use. This website is for informational and portfolio purposes only.</p>

    <h2>Intellectual Property</h2>
    <p>All photographs, films, and content on this website are the exclusive property of Max Schulte. No content may be reproduced, distributed, or used without explicit written permission.</p>

    <h2>Services</h2>
    <p>The services described on this website are subject to separate agreements between Max Schulte and the client. Viewing this website does not constitute a service agreement.</p>

    <h2>Limitation of Liability</h2>
    <p>Max Schulte is not liable for any damages arising from the use or inability to use this website or its content.</p>

    <h2>External Links</h2>
    <p>This website may contain links to external sites. We are not responsible for the content or privacy practices of those sites.</p>

    <h2>Changes to Terms</h2>
    <p>We reserve the right to update these terms at any time. Continued use of the website constitutes acceptance of the updated terms.</p>

    <h2>Governing Law</h2>
    <p>These terms are governed by the laws of Ireland.</p>
  `

  return `
    <div class="legal-page">
      <div class="legal-content">
        <p class="legal-label">${isPrivacy ? 'Privacy Policy' : 'Terms of Use'}</p>
        <h1 class="legal-title">${isPrivacy ? 'Privacy' : 'Terms'}</h1>
        <p class="legal-updated">Last updated: May 2026</p>
        <div class="legal-body">
          ${content}
        </div>
      </div>
    </div>
  `
}