import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
        translation: {
           "Communes": "Communes",
          "Number_Arrondissements": "Nombre d'Arrondissements",
    "Provincial_Capital": "Capitale Provinciale",
    "Number_Faculties": "Nombre de Facultés",
    "Number_Hospitals": "Nombre d'Hôpitaux",
          "page_not_complete": "La page de cette région est en cours de construction. Veuillez revenir plus tard.",
          "home": "Accueil",
          "regions": "Régions",
          "Region":"Région",
          "Provincial Capital":"Chef-lieu",
          "contacte": "Contact",
          "home_title": "Bienvenue sur le Portail Interactif du Maroc",
          "home_description": "Ce site vous permet d’explorer les régions, provinces et communes du Maroc à travers une carte interactive et une navigation intuitive. Découvrez la richesse du pays, de ses paysages à ses cultures, en un seul clic.",
          "general_presentation_title": "Présentation Générale du Maroc",
          "general_presentation_info": "Le Maroc est un pays situé à l'extrême nord-ouest de l’Afrique. Il se distingue par une grande richesse géographique, historique et culturelle.\n\nLe Royaume est divisé en 12 régions administratives, chacune composée de provinces et de communes. Chaque région possède ses caractéristiques naturelles, économiques et culturelles uniques.\n\nLe territoire marocain offre une diversité de paysages impressionnante : montagnes de l'Atlas et du Rif, vastes plaines, oasis, déserts et littoraux maritimes.\n\nSa culture est profondément amazighe, influencée au fil de l’histoire par certaines influences orientales et européennes, ce qui donne au Maroc une identité plurielle et riche.\n\nLe Maroc est également reconnu pour sa gastronomie, son artisanat traditionnel, et ses villes dynamiques mêlant histoire et modernité.",
          "map_title": "Explorez la Carte Interactive",
          "map_description": "Découvrez les 12 régions administratives du Maroc, chacune avec ses provinces, ses cultures et ses paysages uniques. De la vibrante région de Casablanca-Settat aux montagnes majestueuses du Rif, en passant par les déserts dorés du Sahara, chaque région offre une histoire riche et des trésors à explorer. Cliquez sur une région pour en savoir plus sur son patrimoine, ses spécialités locales et ses attractions incontournables !",
          "Key_Statistics":"Key Statistics",
          "Total_Population_title":"Population Totale",
          "Area_title":"Superficie (en km²)",
          "Number_Provinces_title":"Nombre de Provinces",
          "Numbrer_Communes_title":"Nombre de Communes",
          "Urbanization_Rate_title":"Taux d’Urbanisation",
          "By":"By",
          "close": "Fermer",
          "open_menu": "Ouvrir le menu",
          "back": "Retour",
          "Posted on":"Publié le",
          "provinces":"provinces",
          "contact": {
    "title": "Contactez-nous",
    "name": "Nom",
    "email": "Email",
    "subject": "Sujet",
    "message": "Message",
    "consent": "J’accepte de recevoir par SMS et Email des informations de vos services",
    "submit": "Envoyer",
    "close": "Fermer",
    "success": "Message envoyé avec succès !",
    "error": "Erreur lors de l'envoi. Veuillez réessayer.",
    "subjects": {
      "general": "Demande générale",
      "support": "Support",
      "feedback": "Commentaires",
      "partnership": "Partenariat",
      "other": "Autre"
    },
    "errors": {
      "name": "Le nom est requis",
      "email": "Un email valide est requis",
      "subject": "Le sujet est requis",
      "message": "Le message doit contenir au moins 10 caractères",
      "consent": "Vous devez accepter les communications",
      "recaptcha": "Vérification reCAPTCHA requise"
    }},"footer": {
    "contact": {
      "email": "Email",
      "phone": "Téléphone",
      "address": "Adresse"
    },
    "links": {
      "home": "Accueil",
      "contact": "Contactez-nous",
      "about": "À Propos"
    }
  },"error": {
    "title": "URL malformée",
    "message": "Le lien que vous avez entré ne semble pas être un lien valide. Si quelqu'un vous l'a transmis, nous vous conseillons de lui demander de vérifier son exactitude.",
    "back_home": "Retour à l'accueil"
  }
        },
      },
  en:{
    translation: {
      "Communes": "Communes",
      "Number_Arrondissements": "Number of Arrondissements",
    "Provincial_Capital": "Provincial Capital",
    "Number_Faculties": "Number of Faculties",
    "Number_Hospitals": "Number of Hospitals",
      "home": "Home",
      "regions": "Regions",
      "contacte": "Contact",
      "close": "Close",
  "open_menu": "Open Menu",
  "back": "Back",
      "Region":"Region",
      "Provincial Capital":"Provincial Capital",
      "home_title": "Welcome to Morocco's Interactive Portal",
      "home_description": "This site allows you to explore Morocco's regions, provinces, and municipalities through an interactive map and intuitive navigation. Discover the country’s rich landscapes and cultures in just one click.",
      "general_presentation_title": "General Overview of Morocco",
      "general_presentation_info": "Morocco is a country located in the far northwest of Africa. It stands out for its great geographical, historical, and cultural wealth.\n\nThe Kingdom is divided into 12 administrative regions, each composed of provinces and communes. Each region has its unique natural, economic, and cultural characteristics.\n\nMoroccan territory offers an impressive diversity of landscapes: the Atlas and Rif mountains, vast plains, oases, deserts, and maritime coasts.\n\nIts culture is deeply Amazigh, influenced over history by certain Eastern and European influences, giving Morocco a plural and rich identity.\n\nMorocco is also renowned for its gastronomy, traditional craftsmanship, and dynamic cities blending history and modernity.",
      "map_title": "Explore the Interactive Map",
      "map_description": "Discover Morocco’s 12 administrative regions, each with its provinces, cultures, and unique landscapes. From the vibrant Casablanca-Settat region to the majestic Rif mountains, and through the golden Sahara deserts, each region offers a rich history and treasures to explore. Click on a region to learn more about its heritage, local specialties, and must-see attractions!",
      "Key_Statistics":"Key Statistics",
      "Total_Population_title":"Total Population",
      "Area_title":"Area (in km²)",
      "Number_Provinces_title":"Number of Provinces",
      "Numbrer_Communes_title":"Number of Communes",
      "Urbanization_Rate_title":"Urbanization Rate",
      "By":"Par",
      "Posted on":"Posted on",
      "provinces":"provinces",
      "contact": {
    "title": "Contact Us",
    "name": "Name",
    "email": "Email",
    "subject": "Subject",
    "message": "Message",
    "consent": "I agree to receive SMS and Email updates about your services",
    "submit": "Submit",
    "close": "Close",
    "success": "Message sent successfully!",
    "error": "Error sending message. Please try again.",
    "subjects": {
      "general": "General Inquiry",
      "support": "Support",
      "feedback": "Feedback",
      "partnership": "Partnership",
      "other": "Other",
      
    },
    "page_not_complete": "This region's page is still under construction. Please check back later.",
    "errors": {
      "name": "Name is required",
      "email": "A valid email is required",
      "subject": "Subject is required",
      "message": "Message must be at least 10 characters",
      "consent": "You must agree to communications",
      "recaptcha": "reCAPTCHA verification required"
    }},"footer": {
    "contact": {
      "email": "Email",
      "phone": "Phone",
      "address": "Address"
    },
    "links": {
      "home": "Home",
      "contact": "Contact Us",
      "about": "About"
    }
     },
     "error": {
    "title": "Malformed URL",
    "message": "The link you entered does not appear to be a valid link. If someone sent it to you, we suggest asking them to verify its accuracy.",
    "back_home": "Back to Home"
  },
    }
    
  },
  ar: {
    translation: {
      "Communes": "جماعات",
      "Number_Arrondissements": "عدد الأحياء",
      "Provincial_Capital": "العاصمة الإقليمية",
  "Number_Faculties": "عدد الكليات",
  "Number_Hospitals": "عدد المستشفيات",
      "page_not_complete": "صفحة هذه المنطقة لا تزال قيد الإنشاء. يرجى العودة لاحقًا.",
      "home": "الرئيسية",
      "regions": "الجهات",
      "contacte": "اتصل بنا",
      "Region":"الجهة",
      "close": "إغلاق",
  "open_menu": "فتح القائمة",
  "back": "رجوع",
      "Provincial Capital":"عاصمة الإقليم",
      "home_title": "مرحبًا بكم في البوابة التفاعلية للمغرب",
      "home_description": "يتيح لك هذا الموقع استكشاف جهات وأقاليم وجماعات المغرب من خلال خريطة تفاعلية وتصفح سهل. اكتشف تنوع البلاد وثقافتها من خلال نقرة واحدة.",
      "general_presentation_title": "تقديم عام للمغرب",
      "general_presentation_info": "المغرب بلد يقع في أقصى شمال غرب إفريقيا. يتميز بثروة جغرافية وتاريخية وثقافية كبيرة.\n\nينقسم المملكة إلى 12 جهة إدارية، تتكون كل منها من أقاليم وبلديات. كل جهة لها خصائصها الطبيعية والاقتصادية والثقافية الفريدة.\n\nيوفر الإقليم المغربي تنوعًا مذهلاً في المناظر الطبيعية: جبال الأطلس والريف، السهول الشاسعة، الواحات، الصحاري، والسواحل البحرية.\n\nثقافتها أمازيغية عميقة، تأثرت عبر التاريخ ببعض التأثيرات الشرقية والأوروبية، مما يمنح المغرب هوية غنية ومتنوعة.\n\nيشتهر المغرب أيضًا بمأكولاته، وحرفيه التقليدية، ومدنه الديناميكية التي تمزج التاريخ والحداثة.",
      "map_title": "استكشف الخريطة التفاعلية",
      "map_description": "اكتشف الجهات الإدارية الـ 12 للمغرب، كل منها بأقاليمها وثقافاتها ومناظرها الطبيعية الفريدة. من جهة الدار البيضاء-سطات النابضة بالحياة إلى جبال الريف المهيبة، وصولاً إلى صحاري الذهب في الصحراء، تقدم كل جهة تاريخًا غنيًا وكنوزًا للاستكشاف. انقر على جهة لمعرفة المزيد عن تراثها، وتخصصاتها المحلية، ومعالمها السياحية التي يجب زيارتها!",
      "Key_Statistics":"إحصائيات رئيسية",
      "Total_Population_title":"إجمالي السكان",
      "Area_title":"المساحة (كم²)",
      "Number_Provinces_title":"عدد الأقاليم",
      "Numbrer_Communes_title":"عدد الجماعات",
      "Urbanization_Rate_title":"نسبة التمدن",
      "By":"بقلم",
      "Posted on":"نُشر في",
      "provinces":"إقليم",
      "error": {
        "title": "رابط غير صحيح",
       "message": "الرابط الذي أدخلته لا يبدو أنه رابط صالح. إذا أرسله لك شخص ما، نقترح عليك طلب التحقق من صحته.",
       "back_home": "العودة إلى الصفحة الرئيسية"
     },
      "contact": {
    "title": "تواصلوا معنا",
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "subject": "الموضوع",
    "message": "الرسالة",
    "consent": "أوافق على تلقي معلومات عن خدماتكم عبر الرسائل النصية والبريد الإلكتروني",
    "submit": "إرسال",
    "close": "إغلاق",
    "success": "تم إرسال الرسالة بنجاح!",
    "error": "خطأ في الإرسال. حاول مرة أخرى.",
    "subjects": {
      "general": "استفسار عام",
      "support": "الدعم",
      "feedback": "تعليقات",
      "partnership": "شراكة",
      "other": "آخر"
    },
    "errors": {
      "name": "الاسم مطلوب",
      "email": "البريد الإلكتروني الصحيح مطلوب",
      "subject": "الموضوع مطلوب",
      "message": "يجب أن تحتوي الرسالة على 10 أحرف على الأقل",
      "consent": "يجب الموافقة على الاتصالات",
      "recaptcha": "التحقق من reCAPTCHA مطلوب"
    }
  },"footer": {
    "contact": {
      "email": "البريد الإلكتروني",
      "phone": "الهاتف",
      "address": "العنوان"
    },
    "links": {
      "home": "الرئيسية",
      "contact": "اتصل بنا",
      "about": "معلومات عنا"
    }
  }
    },
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // Default language set to French
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;