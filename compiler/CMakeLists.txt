cmake_minimum_required(VERSION 3.0)

project(arrp-web-service)

set(CMAKE_CXX_STANDARD 17)

add_subdirectory(server)

install(DIRECTORY arrp/ DESTINATION arrp)
