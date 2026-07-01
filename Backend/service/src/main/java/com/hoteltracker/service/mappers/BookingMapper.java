package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.BookingRequest;
import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.model.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, RoomMapper.class})
public interface BookingMapper {
    
    BookingResponse toResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true) 
    @Mapping(target = "room", ignore = true)  
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Booking toEntity(BookingRequest request);
}