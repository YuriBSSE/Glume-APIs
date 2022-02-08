var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var keys = require('../config/keys');

function updateCustomerPaymentProfile(customerProfileId, customerPaymentProfileId,data, callback) {

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(keys.apiLoginKey);
	merchantAuthenticationType.setTransactionKey(keys.transactionKey);

	var creditCardForUpdate = new ApiContracts.CreditCardType();
	creditCardForUpdate.setCardNumber(data.cardNum);
	creditCardForUpdate.setExpirationDate(data.expire);

	var paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCardForUpdate);

	var customerAddressType = new ApiContracts.CustomerAddressType();
	customerAddressType.setFirstName(data.first_name);
	customerAddressType.setLastName(data.last_name);
	customerAddressType.setAddress(data.address);
	customerAddressType.setCity("1");
	customerAddressType.setState("1");
	customerAddressType.setZip("1");
	customerAddressType.setCountry(data.address);
	customerAddressType.setPhoneNumber(data.number);

	var customerForUpdate = new ApiContracts.CustomerPaymentProfileExType();
	customerForUpdate.setPayment(paymentType);
	//customerForUpdate.setDefaultPaymentProfile(true);

	customerForUpdate.setCustomerPaymentProfileId(customerPaymentProfileId);
	customerForUpdate.setBillTo(customerAddressType);

	var updateRequest = new ApiContracts.UpdateCustomerPaymentProfileRequest();
	updateRequest.setMerchantAuthentication(merchantAuthenticationType);
	updateRequest.setCustomerProfileId(customerProfileId);	
	updateRequest.setPaymentProfile(customerForUpdate);
	updateRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);

	//pretty print request
	console.log(JSON.stringify(updateRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.UpdateCustomerPaymentProfileController(updateRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.UpdateCustomerPaymentProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('Successfully updated a customer payment profile with id: ' + customerPaymentProfileId);
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			console.log('Null response received');
		}

		callback(response);
	});
}

if (require.main === module) {
	updateCustomerPaymentProfile('1929176981', '1841409255', function(){
		console.log('updateCustomerPaymentProfile call complete.');
	});
}

module.exports.updateCustomerPaymentProfile = updateCustomerPaymentProfile;