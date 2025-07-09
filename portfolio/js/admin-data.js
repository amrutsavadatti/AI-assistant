// Admin Data Store

const dataStore = (function() {
    // Generate a unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    // Local storage keys
    const KEYS = {
        PERSONAL_INFO: 'portfolio_personal_info',
        EXPERIENCES: 'portfolio_experiences',
        SKILLS: 'portfolio_skills',
        CATEGORIES: 'portfolio_skill_categories',
        RESUME: 'portfolio_resume',
        PROFILE_PIC: 'portfolio_profile_pic'
    };

    // Default data
    const DEFAULT_DATA = {
        personalInfo: {
            name: 'Amrut Savadatti',
            title: 'Software Developer',
            bio: 'Passionate software developer with a love for crafting scalable solutions through innovative architecture and clean code.',
            linkedin: 'https://www.linkedin.com/in/amrut-savadatti-277069183/',
            github: 'https://github.com/amrutsavadatti',
            email: 'amrutsavadatti+careers@gmail.com',
            phone: '+17745257497'
        },
        experiences: [
            {
                id: '1',
                jobTitle: 'Web Applications Developer',
                company: 'Media.net',
                jobType: 'Full time',
                startDate: '2021',
                endDate: '2024',
                description: 'Contributed to the Search Engine Monetization team by building tools to assist the business team in making informed decisions when launching ad campaigns. I worked on projects like a centralized data processor for data integration, maintained core APIs powering product sites, and developed analytical tools and Role-Based Access Control APIs. I implemented technologies like Kafka, Elasticsearch, Logstash, and Druid to optimize API performance for handling large-scale streaming data and logging'
            },
            {
                id: '2',
                jobTitle: 'Mobile App Developer',
                company: 'Gopalak Milk',
                jobType: 'Freelance',
                startDate: 'July 2020',
                endDate: 'June 2021',
                description: 'Worked on a Mobile app using Flutter along with admin dashboards to order milk as a subscription service'
            },
            {
                id: '3',
                jobTitle: 'Fullstack Developer',
                company: 'ShetkariRaja',
                jobType: 'Freelance',
                startDate: 'May 2020',
                endDate: 'May 2020',
                description: 'Built an e-commerce website for selling fresh produce using Magento2 with freecharge payment gateway.'
            },
            {
                id: '4',
                jobTitle: 'Software Developer',
                company: 'Bhaktivedanta Hospital IT department',
                jobType: 'Intern',
                startDate: 'December 2019',
                endDate: 'December 2019',
                description: 'Built a mobile app to track, update and analyze crucial pharmacy logistics.'
            },
            {
                id: '5',
                jobTitle: 'Web Developer',
                company: 'ValueFin',
                jobType: 'Intern',
                startDate: 'June 2019',
                endDate: 'June 2019',
                description: 'Built and maintained Portfolio and Blog sites'
            }
        ],
        categories: [
            { id: '1', name: 'Languages' },
            { id: '2', name: 'Frameworks' },
            { id: '3', name: 'Web Technologies' },
            { id: '4', name: 'Databases' },
            { id: '5', name: 'Technologies' }
        ],
        skills: [
            { id: '1', name: 'C', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg' },
            { id: '2', name: 'Java', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
            { id: '3', name: 'C++', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg' },
            { id: '4', name: 'Dart', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg' },
            { id: '5', name: 'Python', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
            { id: '6', name: 'PHP', category: '1', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg' },
            
            { id: '7', name: 'Spring', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg' },
            { id: '8', name: 'Django', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg' },
            { id: '9', name: 'React', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
            { id: '10', name: 'Node JS', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-line-wordmark.svg' },
            { id: '11', name: 'Flutter', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg' },
            { id: '12', name: 'Android', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-plain.svg' },
            { id: '13', name: 'Next JS', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
            { id: '14', name: 'Laravel', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },
            { id: '15', name: 'Lumen', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/lumen/lumen-original.svg' },
            { id: '16', name: 'CakePHP', category: '2', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cakephp/cakephp-original.svg' },
            
            { id: '17', name: 'HTML', category: '3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
            { id: '18', name: 'CSS', category: '3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
            { id: '19', name: 'JS', category: '3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
            { id: '20', name: 'Typescript', category: '3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
            
            { id: '21', name: 'MySQL', category: '4', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original-wordmark.svg' },
            { id: '22', name: 'MicrosoftSql', category: '4', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original-wordmark.svg' },
            { id: '23', name: 'MongoDB', category: '4', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg' },
            { id: '24', name: 'Firebase', category: '4', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg' },
            
            { id: '25', name: 'Elasticsearch', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/elasticsearch/elasticsearch-original.svg' },
            { id: '26', name: 'Logstash', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/logstash/logstash-original.svg' },
            { id: '27', name: 'Kibana', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kibana/kibana-original.svg' },
            { id: '28', name: 'Redis', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg' },
            { id: '29', name: 'Docker', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
            { id: '30', name: 'ArgoCD', category: '5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/argocd/argocd-original.svg' }
        ]
    };

    // Initialize data if not exists
    const initializeData = () => {
        if (!localStorage.getItem(KEYS.PERSONAL_INFO)) {
            localStorage.setItem(KEYS.PERSONAL_INFO, JSON.stringify(DEFAULT_DATA.personalInfo));
        }
        
        if (!localStorage.getItem(KEYS.EXPERIENCES)) {
            localStorage.setItem(KEYS.EXPERIENCES, JSON.stringify(DEFAULT_DATA.experiences));
        }
        
        if (!localStorage.getItem(KEYS.CATEGORIES)) {
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_DATA.categories));
        }
        
        if (!localStorage.getItem(KEYS.SKILLS)) {
            localStorage.setItem(KEYS.SKILLS, JSON.stringify(DEFAULT_DATA.skills));
        }
        
        // Set default resume path if not set
        if (!localStorage.getItem(KEYS.RESUME)) {
            localStorage.setItem(KEYS.RESUME, './Amrut_CV.pdf');
        }
    };

    // Initialize on load
    initializeData();

    // Return public methods
    return {
        // Personal Info
        getPersonalInfo: () => {
            return JSON.parse(localStorage.getItem(KEYS.PERSONAL_INFO));
        },
        
        savePersonalInfo: (data) => {
            localStorage.setItem(KEYS.PERSONAL_INFO, JSON.stringify(data));
            return true;
        },
        
        saveProfilePicture: (file) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem(KEYS.PROFILE_PIC, e.target.result);
            };
            reader.readAsDataURL(file);
            return true;
        },
        
        getProfilePicUrl: () => {
            return localStorage.getItem(KEYS.PROFILE_PIC);
        },
        
        // Experiences
        getExperiences: () => {
            return JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)) || [];
        },
        
        getExperienceById: (id) => {
            const experiences = JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)) || [];
            return experiences.find(exp => exp.id === id);
        },
        
        addExperience: (data) => {
            const experiences = JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)) || [];
            const newExperience = {
                ...data,
                id: generateId()
            };
            experiences.push(newExperience);
            localStorage.setItem(KEYS.EXPERIENCES, JSON.stringify(experiences));
            return newExperience;
        },
        
        updateExperience: (data) => {
            const experiences = JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)) || [];
            const index = experiences.findIndex(exp => exp.id === data.id);
            
            if (index !== -1) {
                experiences[index] = data;
                localStorage.setItem(KEYS.EXPERIENCES, JSON.stringify(experiences));
                return true;
            }
            return false;
        },
        
        deleteExperience: (id) => {
            const experiences = JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)) || [];
            const filteredExperiences = experiences.filter(exp => exp.id !== id);
            localStorage.setItem(KEYS.EXPERIENCES, JSON.stringify(filteredExperiences));
            return true;
        },
        
        // Skill Categories
        getCategories: () => {
            return JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
        },
        
        getCategoryById: (id) => {
            const categories = JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
            return categories.find(cat => cat.id === id);
        },
        
        addCategory: (data) => {
            const categories = JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
            const newCategory = {
                ...data,
                id: generateId()
            };
            categories.push(newCategory);
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
            return newCategory;
        },
        
        updateCategory: (data) => {
            const categories = JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
            const index = categories.findIndex(cat => cat.id === data.id);
            
            if (index !== -1) {
                categories[index] = data;
                localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
                return true;
            }
            return false;
        },
        
        deleteCategory: (id) => {
            const categories = JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
            const filteredCategories = categories.filter(cat => cat.id !== id);
            localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(filteredCategories));
            
            // Delete associated skills
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            const filteredSkills = skills.filter(skill => skill.category !== id);
            localStorage.setItem(KEYS.SKILLS, JSON.stringify(filteredSkills));
            
            return true;
        },
        
        // Skills
        getSkills: () => {
            return JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
        },
        
        getSkillById: (id) => {
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            return skills.find(skill => skill.id === id);
        },
        
        getSkillsByCategory: (categoryId) => {
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            return skills.filter(skill => skill.category === categoryId);
        },
        
        addSkill: (data) => {
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            const newSkill = {
                ...data,
                id: generateId()
            };
            skills.push(newSkill);
            localStorage.setItem(KEYS.SKILLS, JSON.stringify(skills));
            return newSkill;
        },
        
        updateSkill: (data) => {
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            const index = skills.findIndex(skill => skill.id === data.id);
            
            if (index !== -1) {
                skills[index] = data;
                localStorage.setItem(KEYS.SKILLS, JSON.stringify(skills));
                return true;
            }
            return false;
        },
        
        deleteSkill: (id) => {
            const skills = JSON.parse(localStorage.getItem(KEYS.SKILLS)) || [];
            const filteredSkills = skills.filter(skill => skill.id !== id);
            localStorage.setItem(KEYS.SKILLS, JSON.stringify(filteredSkills));
            return true;
        },
        
        // Resume
        saveResume: (file) => {
            if (file) {
                // If a file is provided, read and store it
                const reader = new FileReader();
                reader.onload = function(e) {
                    localStorage.setItem(KEYS.RESUME, e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                // If no file is provided, use the default local file
                localStorage.setItem(KEYS.RESUME, './Amrut_CV.pdf');
            }
            return true;
        },
        
        getResumeUrl: () => {
            return localStorage.getItem(KEYS.RESUME) || './Amrut_CV.pdf';
        },
        
        // Export all data (for backup)
        exportData: () => {
            return {
                personalInfo: JSON.parse(localStorage.getItem(KEYS.PERSONAL_INFO)),
                experiences: JSON.parse(localStorage.getItem(KEYS.EXPERIENCES)),
                categories: JSON.parse(localStorage.getItem(KEYS.CATEGORIES)),
                skills: JSON.parse(localStorage.getItem(KEYS.SKILLS)),
                resumeUrl: localStorage.getItem(KEYS.RESUME),
                profilePicUrl: localStorage.getItem(KEYS.PROFILE_PIC)
            };
        },
        
        // Import data (from backup)
        importData: (data) => {
            if (data.personalInfo) {
                localStorage.setItem(KEYS.PERSONAL_INFO, JSON.stringify(data.personalInfo));
            }
            if (data.experiences) {
                localStorage.setItem(KEYS.EXPERIENCES, JSON.stringify(data.experiences));
            }
            if (data.categories) {
                localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(data.categories));
            }
            if (data.skills) {
                localStorage.setItem(KEYS.SKILLS, JSON.stringify(data.skills));
            }
            if (data.resumeUrl) {
                localStorage.setItem(KEYS.RESUME, data.resumeUrl);
            }
            if (data.profilePicUrl) {
                localStorage.setItem(KEYS.PROFILE_PIC, data.profilePicUrl);
            }
            return true;
        }
    };
})(); 