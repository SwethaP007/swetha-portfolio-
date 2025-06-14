  // GitHub Issues API integration for blog posts with badge
        async function fetchBlogPosts() {
          try {
            const owner = 'SwethaP007';
            const repo = 'blog-content-';
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=public`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
              throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            const issues = await response.json();
            return issues;
          } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
          }
        }
        
        // Function to render a blog post in the UI with badge
        function renderBlogPost(blogContainer, post) {
          // Create blog post container
          const postElement = document.createElement('div');
          postElement.className = 'blog-post';
          
          // Create title
          const titleElement = document.createElement('h3');
          titleElement.className = 'blog-title';
          titleElement.textContent = post.title;
          
          // Create metadata with badge
          const metaElement = document.createElement('div');
          metaElement.className = 'blog-meta';
          
          const dateCreated = new Date(post.created_at);
          const formattedDate = dateCreated.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Add the badge image next to Swetha P
          metaElement.innerHTML = `
            <span class="blog-date">${formattedDate}</span>
            <span class="blog-author">Swetha P <img src="https://img.icons8.com/?size=100&id=2AuMnRFVB9b1&format=png&color=000000" class="author-badge" alt="Verified Author Badge"></span>
          `;
          
          // Create tags/labels container
          const labelsElement = document.createElement('div');
          labelsElement.className = 'blog-labels';
          
          // Filter out the 'public' label and display the rest as tags
          post.labels.forEach(label => {
            if (label.name !== 'public') {
              const labelElement = document.createElement('span');
              labelElement.className = 'blog-label';
              labelElement.textContent = label.name;
              labelElement.style.backgroundColor = `#${label.color}`;
              labelsElement.appendChild(labelElement);
            }
          });
          
          // Create excerpt (first 150 characters of the body)
          const excerptElement = document.createElement('div');
          excerptElement.className = 'blog-excerpt';
          excerptElement.textContent = post.body.substring(0, 150) + (post.body.length > 150 ? '...' : '');
          
          // Create read more button
          const readMoreElement = document.createElement('button');
          readMoreElement.className = 'blog-read-more';
          readMoreElement.textContent = 'Read More';
          readMoreElement.onclick = () => showFullPost(post);
          
          // Assemble the post element
          postElement.appendChild(titleElement);
          postElement.appendChild(metaElement);
          postElement.appendChild(labelsElement);
          postElement.appendChild(excerptElement);
          postElement.appendChild(readMoreElement);
          
          // Add to container
          blogContainer.appendChild(postElement);
        }
        
        // Function to show the full blog post in a modal
        function showFullPost(post) {
          // Create modal container
          const modalContainer = document.createElement('div');
          modalContainer.className = 'blog-modal-container';
          
          // Create modal content
          const modalContent = document.createElement('div');
          modalContent.className = 'blog-modal-content';
          
          // Create close button
          const closeButton = document.createElement('button');
          closeButton.className = 'blog-modal-close';
          closeButton.innerHTML = '&times;';
          closeButton.onclick = () => document.body.removeChild(modalContainer);
          
          // Create title
          const titleElement = document.createElement('h2');
          titleElement.className = 'blog-modal-title';
          titleElement.textContent = post.title;
          
          // Create metadata with badge
          const metaElement = document.createElement('div');
          metaElement.className = 'blog-modal-meta';
          
          const dateCreated = new Date(post.created_at);
          const formattedDate = dateCreated.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Add the badge image next to Swetha P
          metaElement.innerHTML = `
            <span class="blog-date">${formattedDate}</span>
            <span class="blog-author">Swetha P <img src="https://img.icons8.com/?size=100&id=2AuMnRFVB9b1&format=png&color=000000" class="author-badge" alt="Verified Author Badge"></span>
          `;
          
          // Create content - we'll convert markdown to HTML
          const contentElement = document.createElement('div');
          contentElement.className = 'blog-modal-content-body';
          
          // Convert markdown to HTML (we'll use a simple implementation for now)
          // For a full implementation, use a library like marked.js
          const renderMarkdown = async (markdown) => {
            try {
              // Use GitHub's markdown API to render the content
              const response = await fetch('https://api.github.com/markdown', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: markdown,
                  mode: 'gfm',
                  context: 'SwethaP007/blog-content-'
                })
              });
              
              if (!response.ok) {
                throw new Error('Failed to render markdown');
              }
              
              return await response.text();
            } catch (error) {
              console.error('Error rendering markdown:', error);
              // Fallback to basic rendering if GitHub API fails
              return markdown.replace(/\n/g, '<br>');
            }
          };
          
          // Render markdown and set content
          renderMarkdown(post.body).then(html => {
            contentElement.innerHTML = html;
          });
          
          // Assemble modal
          modalContent.appendChild(closeButton);
          modalContent.appendChild(titleElement);
          modalContent.appendChild(metaElement);
          modalContent.appendChild(contentElement);
          
          modalContainer.appendChild(modalContent);
          document.body.appendChild(modalContainer);
          
          // Add event listener to close modal when clicking outside
          modalContainer.addEventListener('click', (event) => {
            if (event.target === modalContainer) {
              document.body.removeChild(modalContainer);
            }
          });
          
          // Prevent scrolling of the body when modal is open
          document.body.style.overflow = 'hidden';
          
          // Reset overflow when modal is closed
          closeButton.addEventListener('click', () => {
            document.body.style.overflow = '';
          });
        }
        
        // Main function to initialize the blog
        async function initializeBlog() {
          const blogContainer = document.getElementById('blog-posts-container');
          if (!blogContainer) {
            console.error('Blog container not found');
            return;
          }
          
          // Show loading state
          blogContainer.innerHTML = '<div class="blog-loading">Loading blog posts...</div>';
          
          // Fetch blog posts
          const posts = await fetchBlogPosts();
          
          // Clear loading state
          blogContainer.innerHTML = '';
          
          if (posts.length === 0) {
            blogContainer.innerHTML = '<div class="blog-no-posts">No blog posts found</div>';
            return;
          }
          
          // Render each post
          posts.forEach(post => renderBlogPost(blogContainer, post));
        }

        // Mobile Menu Toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }

        // Smooth Scrolling for Navigation Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    if (navMenu) {
                        navMenu.classList.remove('active');
                    }
                    if (mobileMenuToggle) {
                        const icon = mobileMenuToggle.querySelector('i');
                        if (icon) {
                            icon.classList.add('fa-bars');
                            icon.classList.remove('fa-times');
                        }
                    }
                }
            });
        });

        // Scroll to Top Button
        const scrollTopBtn = document.getElementById('scroll-top');
        
        if (scrollTopBtn) {
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 100) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
            });
            
            scrollTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Header Scroll Effect
        const header = document.querySelector('.header');
        let lastScrollTop = 0;
        
        if (header) {
            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            });
        }

        // Intersection Observer for Animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all sections for animation
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });

        // SEO Enhancement: Update page title based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', function() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 100) {
                    current = section.getAttribute('id');
                }
            });
            
            // Update active navigation
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
            
            // Update page title for better SEO
            const titles = {
                'home': 'Swetha P Research Scholar | PhD English Language Teaching',
                'about': 'About Swetha P Research Scholar | PhD Student SRM Institute',
                'education': 'Educational Background - Swetha P Research Scholar',
                'research': 'Research & Experience - Swetha P Research Scholar',
                'projects': 'Research Projects - Swetha P Research Scholar',
                'certifications': 'Professional Certifications - Swetha P Research Scholar',
                'blog': 'Blog - Swetha P Research Scholar | Academic Insights',
                'contact': 'Contact Swetha P Research Scholar | Collaboration'
            };
            
            if (current && titles[current]) {
                document.title = titles[current];
            }
        });

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Swetha P Research Scholar - Academic Portfolio Loaded Successfully');
            
            // Add loading animation
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '1';
            }, 100);
            
            // Initialize Certification Tabs
            const certTabs = document.querySelectorAll('.cert-tab');
            const certContents = document.querySelectorAll('.cert-content');
            
            certTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const target = this.getAttribute('data-tab');
                    
                    // Remove active class from all tabs and contents
                    certTabs.forEach(t => t.classList.remove('active'));
                    certContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    this.classList.add('active');
                    const targetContent = document.getElementById(target);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
            
            // Initialize blog
            initializeBlog();
        });
