import supertest from 'supertest';
import { createApp } from '../../src/app';

export const request = supertest(createApp());
