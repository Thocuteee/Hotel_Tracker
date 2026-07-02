package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.PaymentRequest;
import com.hoteltracker.service.dtos.response.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentById(Integer id);
    PaymentResponse getPaymentByBookingId(Integer bookingId);
    List<PaymentResponse> getAllPayments();
}
