ARG ALPINE_VERSION=:3.10.3

FROM alpine${ALPINE_VERSION} as builder

RUN apk add build-base g++ cmake git linux-headers

RUN mkdir -p /opt/build
WORKDIR /opt/build


# Build Poco

RUN git clone --branch poco-1.9.0-release https://github.com/pocoproject/poco.git
RUN mkdir poco/cmake-build && cd poco/cmake-build && \
    cmake -D ENABLE_CRYPTO=OFF -D ENABLE_DATA=OFF -D ENABLE_ENCODINGS=OFF \
    -D ENABLE_JSON=OFF -D ENABLE_MONGODB=OFF -D ENABLE_PAGECOMPILER=OFF \
    -D ENABLE_PAGECOMPILER_FILE2PAGE=OFF \
    -D ENABLE_REDIS=OFF -D ENABLE_UTIL=OFF -D ENABLE_XML=OFF -D ENABLE_ZIP=OFF \
    .. && make install


# Get arrp build dependencies

RUN apk add autoconf automake libtool gmp-dev python3

# Get arrp repo

RUN git clone https://github.com/jleben/arrp.git && \
    cd arrp && \
    git checkout aec76c2d3fa8e3965ad2d7ae269c85f0f122b7fa && \
    git submodule update --init --recursive

# Build isl

RUN cd arrp/extra/isl && \
    mkdir build && \
    ./autogen.sh && \
    ./configure --prefix=$(pwd)/build && \
    make -j4 install

# Build arrp

# Use Clang from here on
# ENV CC=/usr/bin/clang CXX=/usr/bin/clang++

RUN mkdir arrp/build && cd arrp/build && \
    cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/opt/service/arrp .. && make -j4 install


# Build server

COPY . server/
RUN mkdir server/build && cd server/build && \
    cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/opt/service .. && \
    cmake --build . && make -j4 install .


# Compose service

FROM alpine${ALPINE_VERSION} as service

RUN apk add g++

# Copy Poco
COPY --from=builder /usr/local/lib/libPoco*.so.* /usr/local/lib/
 # Copy server
COPY --from=builder /opt/service /opt/service

WORKDIR /opt/service/request
CMD ["/opt/service/server/arrp-web-server","-d","/opt/service/arrp"]
