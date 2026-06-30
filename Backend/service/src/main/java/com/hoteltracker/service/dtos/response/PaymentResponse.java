package com.hoteltracker.service.dtos.response;

import com.hoteltracker.service.model.enums.PaymentMethod;
import com.hoteltracker.service.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Integer id;
    private Integer bookingId;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime paidAt;
}
