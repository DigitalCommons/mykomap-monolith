# One-shot image that fills the data volume before the back-end starts.
# See fetch-datasets.sh for what it does and the variables it takes.
FROM alpine:3.22

RUN apk add --no-cache git

# Small datasets used when DATASETS is empty (local development and tests)
COPY apps/back-end/test/data/datasets /test-datasets
COPY docker/datasets/fetch-datasets.sh /usr/local/bin/fetch-datasets
RUN chmod +x /usr/local/bin/fetch-datasets

CMD ["fetch-datasets"]
