package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.RoomType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomTypeMapper {
    RoomTypeResponse toResponse(RoomType roomType);

    @Mapping(target = "id", ignore = true)
    RoomType toEntity(RoomTypeRequest request);
}