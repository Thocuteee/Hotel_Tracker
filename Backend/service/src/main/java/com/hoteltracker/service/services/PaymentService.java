package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.PaymentRequest;
import com.hoteltracker.service.dtos.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByBookingId(Integer bookingId);
}