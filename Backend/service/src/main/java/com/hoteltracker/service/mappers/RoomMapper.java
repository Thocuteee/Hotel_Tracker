package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.model.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {RoomTypeMapper.class})
public interface RoomMapper {
    
    RoomResponse toResponse(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roomType", ignore = true) 
    Room toEntity(RoomRequest request);
}