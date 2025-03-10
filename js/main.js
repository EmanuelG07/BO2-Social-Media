class SocialFeed {
    constructor() {
        this.feedContainer = document.getElementById('feed-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.page = 1;
        this.loading = false;
        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.loading) {
                    this.loadMorePosts();
                }
            });
        }, options);

        observer.observe(this.loadingIndicator);
    }

    async loadMorePosts() {
        this.loading = true;
        try {
            const response = await fetch('posts.json');
            const data = await response.json();
            
            const posts = data.posts.slice((this.page - 1) * 2, this.page * 2);
            if (posts.length > 0) {
                posts.forEach(post => this.createPostElement(post));
                this.page++;
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            this.loading = false;
        }
    }

    createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        const timeAgo = this.getTimeAgo(new Date(post.timestamp));
        
        postElement.innerHTML = `
            <div class="post-header">
                <img class="user-avatar" src="${post.userAvatar}" alt="${post.username}">
                <div>
                    <strong>${post.username}</strong>
                    <div class="post-metadata">${timeAgo}</div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image">` : ''}
            </div>
        `;
        
        this.feedContainer.appendChild(postElement);
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SocialFeed();
});

let isLoading = false;
let page = 1;

function createPost(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <div class="post-meta">
            <span>👍 ${post.upvotes}</span>
            <span>💬 ${post.comments}</span>
        </div>
    `;
    return postElement;
}

async function fetchPosts() {
    const posts = Array.from({ length: 5 }, (_, i) => ({
        title: `Post ${page * i + 1}`,
        content: 'This is a sample post content',
        upvotes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100)
    }));
    
    return new Promise(resolve => setTimeout(() => resolve(posts), 1000));
}

async function loadPosts() {
    if (isLoading) return;
    
    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    const posts = await fetchPosts();
    const feedContainer = document.getElementById('feed-container');
    
    posts.forEach(post => {
        feedContainer.appendChild(createPost(post));
    });

    page++;
    isLoading = false;
    loadingIndicator.style.display = 'none';
}

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadPosts();
    }
});

loadPosts();
