# ==============================================================================
# DocLens Multi-stage Dockerfile
# Produces an ultra-lightweight, zero-dependency, secure Alpine container image
# ==============================================================================

# --- Build Stage ---
FROM golang:alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto
ENV CGO_ENABLED=0
ENV GOPROXY=https://goproxy.cn,https://proxy.golang.org,direct

# Cache Go modules dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy application source code
COPY . .

# Compile optimized static binary with debug symbols stripped
RUN GOOS=linux go build -ldflags="-s -w" -o /app/doc-lens .

# --- Runtime Stage ---
FROM alpine:3.21

# Install basic root CA certificates and timezone data
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Prepare standard directories: /data (unified storage) and /docs (direct notes mount)
RUN mkdir -p /data/docs /data/state /docs /app

# Copy compiled single binary and default config template
COPY --from=builder /app/doc-lens /app/doc-lens
COPY config.example.yaml /app/config.example.yaml

EXPOSE 18086

# /data: Unified volume (contains config.yaml, docs/, state/)
# /docs: Optional direct mount for existing local markdown directory
VOLUME ["/data", "/docs"]

ENTRYPOINT ["/app/doc-lens"]
CMD ["-config", "/data/config.yaml"]
