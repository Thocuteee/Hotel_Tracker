package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.PaymentRequest;
import com.hoteltracker.service.dtos.response.PaymentResponse;
import com.hoteltracker.service.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "booking.id", target = "bookingId")
    PaymentResponse toResponse(Payment payment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    Payment toEntity(PaymentRequest request);
}