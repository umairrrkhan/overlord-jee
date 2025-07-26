// Payment module for HopeJEE
import { auth, functions, httpsCallable, getCurrentUser } from './firebase-config.js';

const key_id = 'rzp_live_SfJPUISmzOKxxm'; // Test key
const priceMap = {
    'tier-smart-prep': 74900, // ₹749 in paise
    'tier-elite-ranker': 99900 // ₹999 in paise
};

// Function to handle payment
window.initiatePayment = async function(buttonElement) {
    if (!buttonElement || !buttonElement.nodeType || buttonElement.nodeType !== 1 || !buttonElement.classList || typeof buttonElement.classList.contains !== 'function') {
        console.error('Invalid button element passed to initiatePayment:', buttonElement);
        if (buttonElement) {
            console.error('Button element details:', {
                nodeType: buttonElement.nodeType,
                tagName: buttonElement.tagName,
                className: buttonElement.className
            });
        }
        return;
    }
    const originalButtonText = buttonElement.innerHTML;
    // Find the associated terms checkbox
    const priceCardElement = buttonElement.closest('.price-card');
    const termsCheckbox = priceCardElement ? priceCardElement.querySelector('.terms-checkbox-input') : null;

    if (termsCheckbox && !termsCheckbox.checked) {
        alert('Please accept the Terms of Service to proceed.');
        return;
    }

    buttonElement.disabled = true;
    buttonElement.innerHTML = 'Processing...';
    
    // Get price based on button's parent pricing tier
    let priceTier;
    if (priceCardElement.classList.contains('tier-smart-prep')) {
        priceTier = 'tier-smart-prep';
    } else if (priceCardElement.classList.contains('tier-elite-ranker')) {
        priceTier = 'tier-elite-ranker';
    } else if (priceCardElement.classList.contains('tier-one-rupee')) {
        priceTier = 'tier-one-rupee';
    } else {
        console.error('Unknown price tier for button:', buttonElement);
        return;
    }
    const pdfPrice = priceMap[priceTier];

    const currentUser = getCurrentUser();

    try {
        const createOrderFunction = httpsCallable(functions, 'createRazorpayOrder');
        console.log('Calling createRazorpayOrder with:', { amount: pdfPrice, currency: 'INR', priceTier: priceTier, termsAccepted: termsCheckbox ? termsCheckbox.checked : false });
        const result = await createOrderFunction({ amount: pdfPrice, currency: 'INR', priceTier: priceTier, termsAccepted: termsCheckbox ? termsCheckbox.checked : false });
        console.log('createRazorpayOrder response:', result);
        const orderData = result.data;
        console.log('Order data:', orderData);

        if (!orderData || !orderData.orderId) {
            throw new Error('Failed to create Razorpay order. No orderId received.');
        }

        const options = {
            key: key_id,
            amount: orderData.amount, 
            currency: orderData.currency,
            name: "Hope JEE",
            image: "./images/favicon.ico", // Added logo
            order_id: orderData.orderId,
            handler: async function (response) {
                buttonElement.innerHTML = 'Verifying...';
                // Payment successful, now get the download link
                try {
                    const getPdfLinkFunction = httpsCallable(functions, 'getSecurePdfLink');
                    const linkResult = await getPdfLinkFunction({ paymentId: response.razorpay_payment_id });
                    const downloadUrl = linkResult.data.downloadUrl;
                    const downloadToken = linkResult.data.downloadToken;

                    if (downloadUrl && downloadToken) {
                        alert('Payment successful! Your download will start shortly.');
                        // Create a temporary link and click it to trigger download
                        const a = document.createElement('a');
                        a.href = `${downloadUrl}?token=${downloadToken}`;
                        a.download = 'HopeJEE_AI_Pattern_Guide.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        // Redirect to a thank you page or show a success message
                        window.location.href = 'thank-you.html?payment_id=' + response.razorpay_payment_id + '&token=' + downloadToken;
                    } else {
                        throw new Error('Could not retrieve download link.');
                    }
                } catch (error) {
                    console.error('Error getting PDF link:', error);
                    alert(`Payment was successful, but there was an issue getting your download link. Payment ID: ${response.razorpay_payment_id}. Please contact support.`);
                }
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalButtonText;
            },
            prefill: {
                name: currentUser ? currentUser.displayName || '' : '',
                email: currentUser ? currentUser.email || '' : '',
            },
            notes: {
                firebase_uid: currentUser ? currentUser.uid : null
            },
            theme: {
                color: "#FFC107"
            },
            modal: {
                ondismiss: function(){
                    console.log('Checkout form closed');
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalButtonText;
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response){
            console.error('Razorpay Payment Failed:', response.error);
            alert(`Payment Failed: ${response.error.description} (Reason: ${response.error.reason}, Step: ${response.error.step}). Please try again or contact support if the issue persists.`);
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalButtonText;
        });
        rzp.open();
    } catch (error) {
        console.error('Error initiating payment:', error);
        alert('Could not initiate payment. Please try again later. ' + (error.message || ''));
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalButtonText;
    }
}

// Export payment functions
window.HopeJEEPurchase = {
    initiatePayment: initiatePayment
};