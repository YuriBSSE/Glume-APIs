var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var utils = require('../utils/randomString');
var keys = require('../config/keys');

function createSubscriptionFromCustomerProfile(customerProfileId, customerPaymentProfileId,data, callback) {
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(keys.apiLoginKey);
	merchantAuthenticationType.setTransactionKey(keys.transactionKey);

	var interval = new ApiContracts.PaymentScheduleType.Interval();
	interval.setLength(data.cycle);
	interval.setUnit(ApiContracts.ARBSubscriptionUnitEnum.MONTHS);

	var paymentScheduleType = new ApiContracts.PaymentScheduleType();
	paymentScheduleType.setInterval(interval);
	paymentScheduleType.setStartDate(new Date(data.date).toISOString().substring(0, 10));
	paymentScheduleType.setTotalOccurrences("9999");
    paymentScheduleType.setTrialOccurrences(0);
    
	var customerProfileIdType = new ApiContracts.CustomerProfileIdType();
	customerProfileIdType.setCustomerProfileId(customerProfileId);
	customerProfileIdType.setCustomerPaymentProfileId(customerPaymentProfileId);
	// customerProfileIdType.setCustomerAddressId(customerAddressId);

    var orderDetails = new ApiContracts.OrderType();
	orderDetails.setInvoiceNumber(utils.getRandomAmount());
	orderDetails.setDescription(data.name);

	var arbSubscription = new ApiContracts.ARBSubscriptionType();
	arbSubscription.setName(data.name);
	arbSubscription.setPaymentSchedule(paymentScheduleType);
	arbSubscription.setAmount(data.amount);
    arbSubscription.setTrialAmount(data.amount);
	arbSubscription.setProfile(customerProfileIdType);
    arbSubscription.setOrder(orderDetails)

	var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setSubscription(arbSubscription);

	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				console.log('Subscription Id : ' + response.getSubscriptionId());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			console.log('Null Response.');
		}

		callback(response);
	});
}

// if (require.main === module) {
// 	createSubscriptionFromCustomerProfile('1929176981', '1841409255', '900520864', function(){
// 		console.log('createSubscriptionFromCustomerProfile call complete.');
// 	});
// }

module.exports.createSubscriptionFromCustomerProfile = createSubscriptionFromCustomerProfile;