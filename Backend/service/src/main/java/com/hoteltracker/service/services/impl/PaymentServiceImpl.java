package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.PaymentRequest;
import com.hoteltracker.service.dtos.response.PaymentResponse;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.exceptions.DuplicateResourceException;
import com.hoteltracker.service.mappers.PaymentMapper;
import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.Payment;
import com.hoteltracker.service.model.enums.PaymentStatus;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.PaymentRepository;
import com.hoteltracker.service.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking với ID: " + request.getBookingId()));

        if (paymentRepository.findByBookingId(request.getBookingId()).isPresent()) {
            throw new DuplicateResourceException("Booking này đã được thanh toán!");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        
        BigDecimal amountToPay = request.getAmount() != null ? request.getAmount() : booking.getTotalPrice();
        payment.setAmount(amountToPay);
        
        payment.setPaidAt(LocalDateTime.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.SUCCESS); 

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse getPaymentById(Integer id) {
        return paymentRepository.findById(id)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Payment với ID: " + id));
    }

    @Override
    public PaymentResponse getPaymentByBookingId(Integer bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Payment cho Booking ID: " + bookingId));
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
}