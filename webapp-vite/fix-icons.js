const fs = require('fs');
const path = require('path');

const replacements = [
  // Files already fixed - skip
  
  // RefundPolicyCard.tsx
  {
    file: 'src/components/RefundPolicyCard.tsx',
    old: `import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa';`,
    new: `import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa6';`
  },
  
  // SupportChatWidget.tsx
  {
    file: 'src/components/Support/SupportChatWidget.tsx',
    old: `import { FaCommentAlt, FaTimes, FaPaperPlane, FaTicketAlt } from 'react-icons/fa';`,
    new: `import { FaTimes } from 'react-icons/fa';\nimport { FaCommentAlt, FaPaperPlane, FaTicketAlt } from 'react-icons/fa6';`
  },
  
  // About.tsx
  {
    file: 'src/pages/About.tsx',
    old: `import { FaCheckCircle, FaShieldAlt, FaRocket, FaPhone } from 'react-icons/fa';`,
    new: `import { FaShieldAlt, FaPhone } from 'react-icons/fa';\nimport { FaCheckCircle, FaRocket } from 'react-icons/fa6';`
  },
  
  // Admin pages
  {
    file: 'src/pages/Admin/InvoicesManagementPage.tsx',
    old: `import { FaCar, FaUser, FaDownload, FaSync, FaFileInvoice, FaCheckCircle } from 'react-icons/fa';`,
    new: `import { FaCar, FaUser } from 'react-icons/fa';\nimport { FaDownload, FaSync, FaFileInvoice, FaCheckCircle } from 'react-icons/fa6';`
  },
  
  {
    file: 'src/pages/Admin/SupportManagementPage.tsx',
    old: `import { FaFilter, FaSearch, FaTicketAlt, FaUser, FaClock, FaCheckCircle } from 'react-icons/fa';`,
    new: `import { FaSearch, FaUser, FaClock } from 'react-icons/fa';\nimport { FaFilter, FaTicketAlt, FaCheckCircle } from 'react-icons/fa6';`
  },
  
  // Auth pages
  {
    file: 'src/pages/Auth/ForgotPassword.tsx',
    old: `import { FaEnvelope, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';`,
    new: `import { FaEnvelope } from 'react-icons/fa';\nimport { FaPaperPlane, FaArrowLeft } from 'react-icons/fa6';`
  },
  
  {
    file: 'src/pages/Auth/ResetPassword.tsx',
    old: `import { FaLock, FaCheckCircle } from 'react-icons/fa';`,
    new: `import { FaLock } from 'react-icons/fa';\nimport { FaCheckCircle } from 'react-icons/fa6';`
  },
  
  // BookingDetailsPage
  {
    file: 'src/pages/BookingDetails/BookingDetailsPage.tsx',
    old: `import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaPhone, FaFileDownload } from 'react-icons/fa';`,
    new: `import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaPhone } from 'react-icons/fa';\nimport { FaFileDownload } from 'react-icons/fa6';`
  },
  
  // ClientDashboard/InvoiceHistoryPage
  {
    file: 'src/pages/ClientDashboard/InvoiceHistoryPage.tsx',
    old: `import { FaFileInvoice, FaDownload, FaCar, FaUser } from 'react-icons/fa6';`,
    new: `import { FaCar, FaUser } from 'react-icons/fa';\nimport { FaFileInvoice, FaDownload } from 'react-icons/fa6';`
  },
  
  // Favorites
  {
    file: 'src/pages/Favorites/FavoritesPage.tsx',
    old: `import { FaHeart } from 'react-icons/fa';`,
    new: `import { FaHeart } from 'react-icons/fa6';`
  }
];

replacements.forEach(({ file, old, new: newText }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(old)) {
      content = content.replace(old, newText);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️  Skipped (already fixed or not found): ${file}`);
    }
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n✅ All icon imports fixed!');
