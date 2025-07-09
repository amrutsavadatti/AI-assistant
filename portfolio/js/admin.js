// Admin UI Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(item => item.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Modal handlers
    const setupModal = (modalId, openBtnId, formId) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = document.getElementById(formId);

        // Open modal
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('active');
                // Clear form when adding new item
                form.reset();
                if (form.querySelector('[name="id"]')) {
                    form.querySelector('[name="id"]').value = '';
                }
            });
        }

        // Close modal handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    };

    // Setup modals
    setupModal('experience-modal', 'add-experience', 'experience-form');
    setupModal('category-modal', 'add-category', 'category-form');
    setupModal('skill-modal', 'add-skill', 'skill-form');

    // File preview handlers
    const setupFilePreview = (inputId, previewId, type) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (input && preview) {
            input.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        if (type === 'image') {
                            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                        } else if (type === 'pdf') {
                            preview.innerHTML = `<iframe src="${e.target.result}" frameborder="0"></iframe>`;
                        }
                    };
                    
                    if (type === 'image') {
                        reader.readAsDataURL(file);
                    } else if (type === 'pdf') {
                        reader.readAsDataURL(file);
                    }
                }
            });
        }
    };

    // Setup file previews
    setupFilePreview('profile-pic', 'profile-pic-preview', 'image');
    setupFilePreview('resume-file', 'resume-preview', 'pdf');

    // Handle resume preview overlay
    const resumePreview = document.getElementById('resume-preview');
    if (resumePreview) {
        const resumeUrl = dataStore.getResumeUrl();
        if (resumeUrl) {
            // Create iframe and overlay
            resumePreview.innerHTML = `
                <iframe src="${resumeUrl}#toolbar=0" frameborder="0"></iframe>
                <div class="frame-overlay">
                    <span>Click here to view resume in full screen</span>
                </div>
            `;
            
            // Add click handler to overlay
            const overlay = resumePreview.querySelector('.frame-overlay');
            if (overlay) {
                overlay.addEventListener('click', function() {
                    window.open(resumeUrl, '_blank');
                });
            }
        }
    }

    // Edit and Delete Functions for items
    const setupItemActions = () => {
        // Edit Experience
        document.querySelectorAll('.edit-experience-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.closest('.admin-item').dataset.id;
                const experienceData = dataStore.getExperienceById(itemId);
                
                if (experienceData) {
                    const modal = document.getElementById('experience-modal');
                    const form = document.getElementById('experience-form');
                    
                    // Populate form
                    form.querySelector('#experience-id').value = itemId;
                    form.querySelector('#job-title').value = experienceData.jobTitle;
                    form.querySelector('#company').value = experienceData.company;
                    form.querySelector('#job-type').value = experienceData.jobType;
                    form.querySelector('#start-date').value = experienceData.startDate;
                    form.querySelector('#end-date').value = experienceData.endDate;
                    form.querySelector('#description').value = experienceData.description;
                    
                    // Show modal
                    modal.classList.add('active');
                }
            });
        });

        // Delete Experience
        document.querySelectorAll('.delete-experience-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this experience?')) {
                    const itemId = this.closest('.admin-item').dataset.id;
                    dataStore.deleteExperience(itemId);
                    renderExperienceItems();
                }
            });
        });

        // Edit Category
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.closest('.admin-item').dataset.id;
                const categoryData = dataStore.getCategoryById(itemId);
                
                if (categoryData) {
                    const modal = document.getElementById('category-modal');
                    const form = document.getElementById('category-form');
                    
                    // Populate form
                    form.querySelector('#category-id').value = itemId;
                    form.querySelector('#category-name').value = categoryData.name;
                    
                    // Show modal
                    modal.classList.add('active');
                }
            });
        });

        // Delete Category
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this category? All associated skills will also be deleted.')) {
                    const itemId = this.closest('.admin-item').dataset.id;
                    dataStore.deleteCategory(itemId);
                    renderCategoryItems();
                    renderSkillItems();
                    updateSkillCategoryDropdown();
                }
            });
        });

        // Edit Skill
        document.querySelectorAll('.edit-skill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.closest('.admin-item').dataset.id;
                const skillData = dataStore.getSkillById(itemId);
                
                if (skillData) {
                    const modal = document.getElementById('skill-modal');
                    const form = document.getElementById('skill-form');
                    
                    // Populate form
                    form.querySelector('#skill-id').value = itemId;
                    form.querySelector('#skill-name').value = skillData.name;
                    form.querySelector('#skill-category').value = skillData.category;
                    form.querySelector('#skill-icon').value = skillData.icon;
                    
                    // Show modal
                    modal.classList.add('active');
                }
            });
        });

        // Delete Skill
        document.querySelectorAll('.delete-skill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this skill?')) {
                    const itemId = this.closest('.admin-item').dataset.id;
                    dataStore.deleteSkill(itemId);
                    renderSkillItems();
                }
            });
        });
    };

    // Update skill category dropdown based on available categories
    const updateSkillCategoryDropdown = () => {
        const dropdown = document.getElementById('skill-category');
        if (dropdown) {
            // Clear existing options
            dropdown.innerHTML = '';
            
            // Add categories as options
            const categories = dataStore.getCategories();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });
        }
    };

    // Handle resume source selection
    const setupResumeSourceSelection = () => {
        const localResumeRadio = document.getElementById('local-resume');
        const customResumeRadio = document.getElementById('custom-resume');
        const resumeFileInput = document.getElementById('resume-file');
        
        if (localResumeRadio && customResumeRadio && resumeFileInput) {
            // Toggle file input based on radio selection
            localResumeRadio.addEventListener('change', function() {
                if (this.checked) {
                    resumeFileInput.disabled = true;
                }
            });
            
            customResumeRadio.addEventListener('change', function() {
                if (this.checked) {
                    resumeFileInput.disabled = false;
                }
            });
            
            // Initial state
            resumeFileInput.disabled = localResumeRadio.checked;
        }
    };

    // Form submission handlers
    document.getElementById('personal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('#name').value,
            title: this.querySelector('#title').value,
            bio: this.querySelector('#bio').value,
            linkedin: this.querySelector('#linkedin').value,
            github: this.querySelector('#github').value,
            email: this.querySelector('#email').value,
            phone: this.querySelector('#phone').value
        };
        
        dataStore.savePersonalInfo(formData);
        
        // Handle profile picture separately
        const profilePic = this.querySelector('#profile-pic').files[0];
        if (profilePic) {
            dataStore.saveProfilePicture(profilePic);
        }
        
        showNotification('Personal information saved successfully');
    });

    document.getElementById('experience-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: this.querySelector('#experience-id').value,
            jobTitle: this.querySelector('#job-title').value,
            company: this.querySelector('#company').value,
            jobType: this.querySelector('#job-type').value,
            startDate: this.querySelector('#start-date').value,
            endDate: this.querySelector('#end-date').value,
            description: this.querySelector('#description').value
        };
        
        if (formData.id) {
            dataStore.updateExperience(formData);
        } else {
            dataStore.addExperience(formData);
        }
        
        document.getElementById('experience-modal').classList.remove('active');
        renderExperienceItems();
        showNotification('Experience saved successfully');
    });

    document.getElementById('category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: this.querySelector('#category-id').value,
            name: this.querySelector('#category-name').value
        };
        
        if (formData.id) {
            dataStore.updateCategory(formData);
        } else {
            dataStore.addCategory(formData);
        }
        
        document.getElementById('category-modal').classList.remove('active');
        renderCategoryItems();
        updateSkillCategoryDropdown();
        showNotification('Category saved successfully');
    });

    document.getElementById('skill-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: this.querySelector('#skill-id').value,
            name: this.querySelector('#skill-name').value,
            category: this.querySelector('#skill-category').value,
            icon: this.querySelector('#skill-icon').value
        };
        
        if (formData.id) {
            dataStore.updateSkill(formData);
        } else {
            dataStore.addSkill(formData);
        }
        
        document.getElementById('skill-modal').classList.remove('active');
        renderSkillItems();
        showNotification('Skill saved successfully');
    });

    document.getElementById('resume-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const useLocalResume = document.getElementById('local-resume').checked;
        const resumeFile = document.getElementById('resume-file').files[0];
        
        if (useLocalResume) {
            // Use the default local file
            dataStore.saveResume(null);
            showNotification('Using local resume file (Amrut_CV.pdf)');
            
            // Refresh the preview with local file
            updateResumePreview('./Amrut_CV.pdf');
        } else if (resumeFile) {
            dataStore.saveResume(resumeFile);
            showNotification('Custom resume uploaded successfully');
        } else {
            showNotification('Please select a resume file for upload', 'error');
            return;
        }
    });

    // Helper function to update resume preview
    function updateResumePreview(resumeUrl) {
        const resumePreview = document.getElementById('resume-preview');
        if (resumePreview && resumeUrl) {
            resumePreview.innerHTML = `
                <iframe src="${resumeUrl}#toolbar=0" frameborder="0"></iframe>
                <div class="frame-overlay">
                    <span>Click here to view resume in full screen</span>
                </div>
            `;
            
            // Add click handler to overlay
            const overlay = resumePreview.querySelector('.frame-overlay');
            if (overlay) {
                overlay.addEventListener('click', function() {
                    window.open(resumeUrl, '_blank');
                });
            }
        }
    }

    // Notification system
    const showNotification = (message, type = 'success') => {
        // Check if notification container exists, if not create it
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    };

    // Rendering functions
    const renderExperienceItems = () => {
        const container = document.getElementById('experience-items');
        if (!container) return;
        
        // Get experiences from data store
        const experiences = dataStore.getExperiences();
        
        // Clear container
        container.innerHTML = '';
        
        // Add experience items
        experiences.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.dataset.id = exp.id;
            
            item.innerHTML = `
                <h3>${exp.jobTitle}</h3>
                <p><strong>${exp.company}</strong> | ${exp.startDate} - ${exp.endDate}</p>
                <p>${exp.description.substring(0, 100)}${exp.description.length > 100 ? '...' : ''}</p>
                <div class="item-actions">
                    <button class="action-btn edit-btn edit-experience-btn"><i class='bx bx-edit'></i></button>
                    <button class="action-btn delete-btn delete-experience-btn"><i class='bx bx-trash'></i></button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Re-attach event listeners
        setupItemActions();
    };

    const renderCategoryItems = () => {
        const container = document.getElementById('skill-categories');
        if (!container) return;
        
        // Get categories from data store
        const categories = dataStore.getCategories();
        
        // Clear container
        container.innerHTML = '';
        
        // Add category items
        categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.dataset.id = category.id;
            
            item.innerHTML = `
                <h3>${category.name}</h3>
                <div class="item-actions">
                    <button class="action-btn edit-btn edit-category-btn"><i class='bx bx-edit'></i></button>
                    <button class="action-btn delete-btn delete-category-btn"><i class='bx bx-trash'></i></button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Re-attach event listeners
        setupItemActions();
    };

    const renderSkillItems = () => {
        const container = document.getElementById('skills-items');
        if (!container) return;
        
        // Get skills from data store
        const skills = dataStore.getSkills();
        const categories = dataStore.getCategories();
        
        // Clear container
        container.innerHTML = '';
        
        // Add skill items
        skills.forEach(skill => {
            const category = categories.find(cat => cat.id === skill.category);
            const categoryName = category ? category.name : 'Unknown Category';
            
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.dataset.id = skill.id;
            
            item.innerHTML = `
                <h3>${skill.name}</h3>
                <p><strong>Category:</strong> ${categoryName}</p>
                ${skill.icon ? `<p><img src="${skill.icon}" alt="${skill.name}" style="height: 30px;"></p>` : ''}
                <div class="item-actions">
                    <button class="action-btn edit-btn edit-skill-btn"><i class='bx bx-edit'></i></button>
                    <button class="action-btn delete-btn delete-skill-btn"><i class='bx bx-trash'></i></button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Re-attach event listeners
        setupItemActions();
    };

    // Initial data loading and rendering
    const loadInitialData = () => {
        // Load personal info
        const personalInfo = dataStore.getPersonalInfo();
        if (personalInfo) {
            document.getElementById('name').value = personalInfo.name || '';
            document.getElementById('title').value = personalInfo.title || '';
            document.getElementById('bio').value = personalInfo.bio || '';
            document.getElementById('linkedin').value = personalInfo.linkedin || '';
            document.getElementById('github').value = personalInfo.github || '';
            document.getElementById('email').value = personalInfo.email || '';
            document.getElementById('phone').value = personalInfo.phone || '';
        }
        
        // Render experience items
        renderExperienceItems();
        
        // Render skill categories
        renderCategoryItems();
        
        // Update skill category dropdown
        updateSkillCategoryDropdown();
        
        // Render skills
        renderSkillItems();
        
        // Set up resume source selection
        setupResumeSourceSelection();
        
        // Load resume preview if exists
        const resumeUrl = dataStore.getResumeUrl();
        if (resumeUrl) {
            updateResumePreview(resumeUrl);
        }
        
        // Load profile pic preview if exists
        const profilePicUrl = dataStore.getProfilePicUrl();
        if (profilePicUrl) {
            document.getElementById('profile-pic-preview').innerHTML = `
                <img src="${profilePicUrl}" alt="Profile Picture">
            `;
        }
    };

    // Call initial data loading
    loadInitialData();
}); 