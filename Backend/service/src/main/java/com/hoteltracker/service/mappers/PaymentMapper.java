package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.PaymentRequest;
import com.hoteltracker.service.dtos.response.PaymentResponse;
import com.hoteltracker.service.model.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking() != null ? payment.getBooking().getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .build();
    }

    public Payment toEntity(PaymentRequest request) {
        if (request == null) {
            return null;
        }
        return Payment.builder()
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .build();
    }
}