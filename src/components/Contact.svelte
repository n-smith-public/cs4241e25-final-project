<script>
    export let navigateTo;
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    import swal from 'sweetalert';
    import { onMount } from 'svelte';
    import { getUserEmail, getUserDisplayName, isAuthenticated } from '../utils/auth.js';

    let email = '';
    let displayName = '';
    let subject = '';
    let contents = '';
    let category = '';
    let isSubmitting = false;

    onMount(() => {
        email = getUserEmail();
        displayName = getUserDisplayName();
        console.log('Email:', email, 'DisplayName:', displayName); // Debug log
    });

    async function handleEmail(e) {
        e.preventDefault();

        if (!subject.trim() || !contents.trim() || !category) {
            swal({
                title: "Error",
                text: "Please fill in all fields.",
                icon: "error"
            });
            return;
        }

        isSubmitting = true;

        try {
            const response = await fetch('/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    displayName,
                    subject,
                    contents,
                    category
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                swal({
                    title: "Success",
                    text: "Your message has been sent successfully.",
                    icon: "success"
                });
                subject = '';
                contents = '';
                category = '';
            } else {
                swal({
                    title: "Error",
                    text: result.message || "An error occurred while sending your message.",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error("Error sending email:", error);
            swal({
                title: "Error",
                text: "An unexpected error occurred. Please try again later.",
                icon: "error"
            });
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Header 
  greeting="Contact Us" 
  showLogin={false} 
  showRegister={false} 
  showSettings={true}
  authRequired={true} 
  {navigateTo}
/>

<article class="card">
    <h2>Contact Us</h2>
    <p>Have a question or need help? Send us a message and we'll get back to you as soon as possible.</p>
    <hr style="margin-bottom: 2rem; margin-top: 0;">

    <form on:submit|preventDefault={handleEmail} class="contact-form">
        <!-- Email and Name in one row -->
        <div class="form-row">
            <div class="form-group">
                <label for="user-email">Your Email:</label>
                <input
                    type="email"
                    id="user-email"
                    bind:value={email}
                    readonly
                    class="field readonly-field"
                    aria-label="The email address associated with your account"
                />
            </div>
            <div class="form-group">
                <label for="display-name">Your Name:</label>
                <input
                    type="text"
                    id="display-name"
                    bind:value={displayName}
                    readonly
                    class="field readonly-field"
                    aria-label="The name associated with your account"
                />
            </div>
        </div>

        <!-- Category full width -->
        <div class="form-group">
            <label for="category">Category: <span class="required">*</span></label>
            <select id="category" bind:value={category} required class="field">
                <option value="" disabled selected>Select a category</option>
                <option value="bug-report">Bug Report</option>
                <option value="feature-request">Feature Request</option>
                <option value="account-issue">Account Issue</option>
                <option value="technical-support">Technical Support</option>
                <option value="general-inquiry">General Inquiry</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
            </select>
        </div>

        <!-- Subject full width -->
        <div class="form-group">
            <label for="subject">Subject: <span class="required">*</span></label>
            <input
                type="text"
                id="subject"
                bind:value={subject}
                required
                class="field"
                maxlength="100"
                minlength="5"
                placeholder="A brief description of your inquiry"
                aria-describedby="subject-help"
            />
            <small id="subject-help" class="help-text">Max 100 characters.</small>
        </div>

        <!-- Message full width -->
        <div class="form-group">
            <label for="contents">Message: <span class="required">*</span></label>
            <textarea
                id="contents"
                bind:value={contents}
                required
                class="field"
                rows="6"
                placeholder="Please provide details about your inquiry..."
                aria-describedby="contents-help"
                minlength="50"
                maxlength="4000"
            ></textarea>
            <small id="contents-help" class="help-text">Please provide as much detail as possible. Must be between 50 and 4000 characters</small>
        </div>

        <!-- Centered submit button -->
        <div class="button-container">
            <button
                type="submit"
                class="submit-btn pure-button pure-button-primary"
                disabled={isSubmitting}
                aria-label="Send us your message"
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
        </div>
    </form>
</article>

<Footer 
  navigateTo={navigateTo} 
  onHome={false}
  onTasks={false}
/>

<style>
    .card {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: var(--base);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--option);
    }

    .card h2 {
        color: var(--option);
        margin-bottom: 0.5rem;
        font-size: 1.8rem;
    }

    .card p {
        color: var(--option);
        margin-bottom: 2rem;
        line-height: 1.5;
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 600;
        color: var(--option);
        font-size: 0.9rem;
    }

    .required {
        color: var(--highlight);
    }

    /* Fix: Follow Home.svelte pattern for form fields */
    .field {
        padding: 0.75rem;
        border: 1px solid var(--option);
        border-radius: 4px;
        background: var(--base);
        color: var(--option); /* Change from var(--text) to var(--option) like Home.svelte */
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }

    .field:focus {
        outline: none;
        border-color: var(--links);
        box-shadow: 0 0 0 2px rgba(17, 77, 156, 0.1);
    }

    .readonly-field {
        cursor: not-allowed;
        opacity: 0.8;
        color: var(--option);
    }

    /* Fix: Follow Home.svelte pattern for select and options */
    select.field {
        background: var(--base);
        color: var(--option); /* Change from var(--text) to var(--option) */
    }

    select.field option {
        background: var(--base);
        color: var(--option); /* Change from var(--text) to var(--option) */
    }

    textarea.field {
        resize: vertical;
        min-height: 120px;
        font-family: inherit;
        background: var(--base);
        color: var(--option); /* Change from var(--text) to var(--option) */
    }

    .help-text {
        color: var(--option);
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }

    .button-container {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .submit-btn {
        padding: 0.75rem 2rem;
        background-color: var(--links);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: var(--highlight);
    }

    .submit-btn:disabled {
        background-color: var(--option);
        cursor: not-allowed;
        opacity: 0.6;
    }

    @media (max-width: 600px) {
        .form-row {
            grid-template-columns: 1fr;
        }

        .card {
            margin: 1rem;
            padding: 1.5rem;
        }
    }
</style>