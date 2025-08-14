// --- Main App Logic ---
const App = {
    // Scripts that run once on initial load
    init() {
        this.theme.init();
        this.threeBg.init();
        this.cursor.init();
        this.gsap.init();
        this.api.init();
        this.projects.init();
        this.experience.init();
        this.contactForm.init();
    },
    theme: {
        init() {
            const toggle = document.getElementById('theme-toggle');
            this.sunIcon = document.getElementById('theme-icon-sun');
            this.moonIcon = document.getElementById('theme-icon-moon');
            toggle.addEventListener('click', () => this.toggle());
            this.updateIcons();
        },
        toggle() {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            this.updateIcons();
            App.threeBg.updateColors();
        },
        updateIcons() {
            const isDark = document.documentElement.classList.contains('dark');
            this.sunIcon.classList.toggle('hidden', isDark);
            this.moonIcon.classList.toggle('hidden', !isDark);
        }
    },
    cursor: {
        init() {
            this.el = document.querySelector('.cursor-dot');
            if (!this.el) return;
            window.addEventListener('mousemove', e => {
                this.el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            });
            document.addEventListener('mouseenter', () => this.el.style.opacity = 1);
            document.addEventListener('mouseleave', () => this.el.style.opacity = 0);
            
            document.body.addEventListener('mouseover', (e) => {
                if (e.target.closest('a, button, [role="button"]')) {
                   this.el.classList.add('hovered');
                }
            });
             document.body.addEventListener('mouseout', (e) => {
                if (e.target.closest('a, button, [role="button"]')) {
                   this.el.classList.remove('hovered');
                }
            });
        }
    },
    threeBg: {
        init() {
            this.container = document.getElementById('three-bg');
            if (!this.container) return;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);
            this.camera.position.z = 5;
            this.mouse = new THREE.Vector2();

            this.createParticles();
            this.updateColors();
            this.animate();

            window.addEventListener('resize', () => this.onWindowResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        },
        createParticles() {
            const particles = 5000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particles * 3);
            for (let i = 0; i < particles * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 10;
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.material = new THREE.PointsMaterial({ size: 0.005 });
            this.points = new THREE.Points(geometry, this.material);
            this.scene.add(this.points);
        },
        updateColors() {
            if (!this.material) return;
            const isDark = document.documentElement.classList.contains('dark');
            this.material.color.set(isDark ? 0x3b82f6 : 0x8b5cf6);
        },
        animate() {
            if(!this.renderer) return;
            requestAnimationFrame(() => this.animate());
            this.points.rotation.x += 0.0001 + this.mouse.y * 0.0005;
            this.points.rotation.y += 0.0001 + this.mouse.x * 0.0005;
            this.renderer.render(this.scene, this.camera);
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },
        onMouseMove(event) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    },
    gsap: {
        init() {
            gsap.registerPlugin(ScrollTrigger);
            document.querySelectorAll('.gsap-reveal').forEach(el => {
                gsap.from(el, {
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    ease: "power3.out"
                });
            });
        }
    },
    api: {
        init() {
            this.getGitHubStats();
        },
        async getGitHubStats() {
            const reposEl = document.getElementById('github-repos');
            const followersEl = document.getElementById('github-followers');
            if (!reposEl || !followersEl) return;
            try {
                const response = await fetch('https://api.github.com/users/shriansh1625');
                if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
                const data = await response.json();
                reposEl.textContent = data.public_repos ?? 'N/A';
                followersEl.textContent = data.followers ?? 'N/A';
            } catch (error) {
                console.error('Failed to fetch GitHub stats:', error);
                reposEl.textContent = 'Error';
                followersEl.textContent = 'Error';
            }
        }
    },
    projects: {
        init() {
            this.container = document.getElementById('project-grid');
            this.filtersContainer = document.getElementById('project-filters');
            if (!this.container || !this.filtersContainer) return;

            this.data = [
                { title: "AI Powered Analysis Suite", description: "A full-stack web application to perform deep, multi-faceted analysis of online content...", category: "AI/ML" },
                { title: "VisionFit AI", description: "An intelligent virtual fitness coach using a webcam and TensorFlow.js to analyze exercise form...", category: "AI/ML" },
                { title: "Open Source Contributions", description: "Active contributor to various projects during GSSOC '25, focusing on backend and infrastructure.", category: "Open Source" },
                { title: "Cloud Hosting Architecture", description: "Designed a scalable hosting architecture using AWS Elastic Beanstalk for a high-growth client.", category: "Cloud" }
            ];
            this.renderFilters();
            this.renderProjects('all');
        },
        renderFilters() {
            const categories = ['all', ...new Set(this.data.map(p => p.category))];
            this.filtersContainer.innerHTML = categories.map(cat => `
                <button class="filter-btn font-code text-sm py-1 px-3 rounded-full transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
                    ${cat}
                </button>
            `).join('');
            this.filtersContainer.addEventListener('click', e => {
                if (e.target.matches('.filter-btn')) {
                    this.filtersContainer.querySelector('.active').classList.remove('active');
                    e.target.classList.add('active');
                    this.renderProjects(e.target.dataset.filter);
                }
            });
        },
        renderProjects(filter) {
            const filteredData = filter === 'all' ? this.data : this.data.filter(p => p.category === filter);
            
            gsap.to(this.container.children, {
                opacity: 0,
                scale: 0.95,
                duration: 0.3,
                stagger: 0.05,
                onComplete: () => {
                    this.container.innerHTML = filteredData.map(p => `
                        <div class="project-card card rounded-lg overflow-hidden">
                            <div class="p-6">
                                <h3 class="text-xl font-bold text-slate-800 dark:text-white">${p.title}</h3>
                                <p class="mt-2 text-slate-600 dark:text-slate-400">${p.description}</p>
                                <span class="font-code text-xs mt-4 inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 py-1 px-2 rounded">${p.category}</span>
                            </div>
                        </div>
                    `).join('');
                    gsap.from(this.container.children, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.3,
                        stagger: 0.05
                    });
                }
            });
        }
    },
    experience: {
        init() {
            const container = document.getElementById('experience-container');
            if (!container) return;
            const experiences = [
                { date: "July 2025 - Present", title: "Open Source Contributor", company: "GirlScript Summer of Code (GSSOC)", description: "Contributing to impactful open-source projects, refining problem-solving abilities within a dynamic community." },
                { date: "June 2025 - Present", title: "AI-ML Virtual Intern", company: "IBM-EduSkills", description: "Gaining hands-on experience with supervised learning, model training, and cloud deployment tools on real-world AI projects." },
                { date: "June 2025 - July 2025", title: "Solutions Architecture Virtual Experience", company: "Amazon Web Services (AWS)", description: "Designed a scalable hosting architecture using Elastic Beanstalk to improve client response times and growth potential." }
            ];
            container.innerHTML = `
                <div class="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700 timeline-line"></div>
                <div class="space-y-12">
                    ${experiences.map(exp => `
                        <div class="relative pl-12">
                            <div class="timeline-dot absolute left-4 top-1.5 transform -translate-x-1/2 w-4 h-4 rounded-full"></div>
                            <p class="font-code text-sm text-slate-500">${exp.date}</p>
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white mt-1">${exp.title}</h3>
                            <p class="text-slate-600 dark:text-slate-300">${exp.company}</p>
                            <p class="mt-2 text-slate-600 dark:text-slate-400">${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },
    contactForm: {
        init() {
            this.form = document.getElementById('contact-form');
            if (!this.form) return;
            this.toast = document.getElementById('toast-notification');
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        showToast(message, isSuccess) {
            this.toast.textContent = message;
            this.toast.className = `toast p-4 rounded-lg shadow-lg text-white ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`;
            this.toast.classList.add('show');
            setTimeout(() => this.toast.classList.remove('show'), 3000);
        },
        handleSubmit(e) {
            e.preventDefault();
            // This is a simulation and does not actually send an email.
            // For a real form, integrate a service like Netlify Forms or Formspree.
            const submitBtn = this.form.querySelector('button');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.backgroundColor = '#16a34a';
                this.showToast('Message sent successfully! Thank you.', true);
                this.form.reset();
                setTimeout(() => {
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }, 1500);
        }
    }
};

// Initialize the app
App.init();